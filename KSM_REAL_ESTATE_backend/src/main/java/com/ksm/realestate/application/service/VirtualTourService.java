package com.ksm.realestate.application.service;

import com.ksm.realestate.application.port.in.GetVirtualTourUseCase;
import com.ksm.realestate.application.port.in.UploadVirtualTourImagesUseCase;
import com.ksm.realestate.application.port.out.LocalFileStoragePort;
import com.ksm.realestate.application.port.out.PaymentRepositoryPort;
import com.ksm.realestate.application.port.out.PropertyRepositoryPort;
import com.ksm.realestate.application.port.out.VirtualTourImageRepositoryPort;
import com.ksm.realestate.domain.exception.BusinessException;
import com.ksm.realestate.domain.exception.PropertyNotFoundException;
import com.ksm.realestate.domain.exception.VirtualTourNotPurchasedException;
import com.ksm.realestate.domain.model.VirtualTourImage;
import lombok.RequiredArgsConstructor;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Service managing access and upload of virtual tour images.
 *
 * @author ulrich675
 * @date 2026-07-17
 */
@Service
@RequiredArgsConstructor
public class VirtualTourService implements GetVirtualTourUseCase, UploadVirtualTourImagesUseCase {

    private final VirtualTourImageRepositoryPort virtualTourImageRepositoryPort;
    private final PaymentRepositoryPort paymentRepositoryPort;
    private final LocalFileStoragePort localFileStoragePort;
    private final PropertyRepositoryPort propertyRepositoryPort;

    @Override
    public Flux<VirtualTourImage> getVirtualTour(Long propertyId, Long requestingUserId) {
        return propertyRepositoryPort.findById(propertyId)
                .switchIfEmpty(Mono.error(new PropertyNotFoundException(propertyId)))
                .flatMapMany(property -> {
                    // Owner always has access
                    if (property.getOwnerId().equals(requestingUserId)) {
                        return virtualTourImageRepositoryPort.findByPropertyId(propertyId);
                    }

                    // Otherwise, check for purchased virtual tour via PaymentRepositoryPort
                    return paymentRepositoryPort.hasCompletedVirtualVisitPurchase(requestingUserId, propertyId)
                            .flatMapMany(hasPurchased -> {
                                if (!hasPurchased) {
                                    return Flux.error(new VirtualTourNotPurchasedException(propertyId.toString(),
                                            requestingUserId.toString()));
                                }
                                return virtualTourImageRepositoryPort.findByPropertyId(propertyId);
                            });
                });
    }

    @Override
    public Flux<VirtualTourImage> uploadImages(Long propertyId, Long ownerId, List<FilePart> files,
            List<String> roomLabels) {
        if (files == null || roomLabels == null || files.size() != roomLabels.size()) {
            return Flux.error(new BusinessException("INVALID_UPLOAD",
                    "Files and room labels must be provided and match in size."));
        }

        return propertyRepositoryPort.findById(propertyId)
                .switchIfEmpty(Mono.error(new PropertyNotFoundException(propertyId)))
                .flatMapMany(property -> {
                    if (!property.getOwnerId().equals(ownerId)) {
                        return Flux.error(new BusinessException("AUTHORIZATION_ERROR",
                                "Only the owner can upload virtual tour images."));
                    }

                    // Wipe existing images for simplicity, then upload new ones
                    return virtualTourImageRepositoryPort.deleteByPropertyId(propertyId)
                            .thenMany(Flux.fromIterable(files)
                                    .index()
                                    .flatMapSequential(tuple -> {
                                        long index = tuple.getT1();
                                        FilePart file = tuple.getT2();
                                        String label = roomLabels.get((int) index);

                                        return localFileStoragePort.store(file, propertyId.toString())
                                                .flatMap(savedUrl -> {
                                                    VirtualTourImage img = VirtualTourImage.builder()
                                                            .propertyId(propertyId)
                                                            .roomLabel(label)
                                                            .imageUrl(savedUrl)
                                                            .displayOrder((int) index + 1)
                                                            .build();
                                                    return virtualTourImageRepositoryPort.save(img);
                                                });
                                    }));
                });
    }
}
