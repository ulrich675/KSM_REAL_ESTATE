package com.ksm.realestate.application.port.in;

import com.ksm.realestate.domain.model.VirtualTourImage;
import org.springframework.http.codec.multipart.FilePart;
import reactor.core.publisher.Flux;

import java.util.List;

/**
 * Input port for uploading virtual tour images.
 *
 * @author ulrich675
 * @date 2026-07-17
 */
public interface UploadVirtualTourImagesUseCase {

    /**
     * Uploads and stores 360 virtual tour images, restricted to the property owner.
     */
    Flux<VirtualTourImage> uploadImages(Long propertyId, Long ownerId, List<FilePart> files, List<String> roomLabels);
}
