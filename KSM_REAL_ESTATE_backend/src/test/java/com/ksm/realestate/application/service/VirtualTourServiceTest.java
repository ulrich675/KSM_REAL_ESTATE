package com.ksm.realestate.application.service;

import com.ksm.realestate.application.port.out.LocalFileStoragePort;
import com.ksm.realestate.application.port.out.PaymentRepositoryPort;
import com.ksm.realestate.application.port.out.PropertyRepositoryPort;
import com.ksm.realestate.application.port.out.VirtualTourImageRepositoryPort;
import com.ksm.realestate.domain.exception.BusinessException;
import com.ksm.realestate.domain.exception.PropertyNotFoundException;
import com.ksm.realestate.domain.exception.VirtualTourNotPurchasedException;
import com.ksm.realestate.domain.model.Property;
import com.ksm.realestate.domain.model.VirtualTourImage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.codec.multipart.FilePart;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Unit tests for VirtualTourService.
 *
 * @author ulrich675
 */
@ExtendWith(MockitoExtension.class)
class VirtualTourServiceTest {

    @Mock
    private VirtualTourImageRepositoryPort imageRepo;
    @Mock
    private PaymentRepositoryPort paymentRepo;
    @Mock
    private LocalFileStoragePort storagePort;
    @Mock
    private PropertyRepositoryPort propertyRepo;

    @InjectMocks
    private VirtualTourService virtualTourService;

    private Property property;

    @BeforeEach
    void setUp() {
        property = new Property();
        property.setPropertyId(1L);
        property.setOwnerId(2L);
    }

    @Test
    void getVirtualTour_Success_WhenOwner() {
        VirtualTourImage img = new VirtualTourImage();
        when(propertyRepo.findById(1L)).thenReturn(Mono.just(property));
        when(imageRepo.findByPropertyId(1L)).thenReturn(Flux.just(img));

        StepVerifier.create(virtualTourService.getVirtualTour(1L, 2L))
                .expectNextCount(1)
                .verifyComplete();
    }

    @Test
    void getVirtualTour_Success_WhenPurchased() {
        VirtualTourImage img = new VirtualTourImage();
        when(propertyRepo.findById(1L)).thenReturn(Mono.just(property));
        // User 3 is not owner
        when(paymentRepo.hasCompletedVirtualVisitPurchase(3L, 1L)).thenReturn(Mono.just(true));
        when(imageRepo.findByPropertyId(1L)).thenReturn(Flux.just(img));

        StepVerifier.create(virtualTourService.getVirtualTour(1L, 3L))
                .expectNextCount(1)
                .verifyComplete();
    }

    @Test
    void getVirtualTour_Fails_WhenNotPurchased() {
        when(propertyRepo.findById(1L)).thenReturn(Mono.just(property));
        // User 3 is not owner
        when(paymentRepo.hasCompletedVirtualVisitPurchase(3L, 1L)).thenReturn(Mono.just(false));

        StepVerifier.create(virtualTourService.getVirtualTour(1L, 3L))
                .expectError(VirtualTourNotPurchasedException.class)
                .verify();
    }

    @Test
    void uploadImages_Success_WhenOwner() {
        FilePart file = mock(FilePart.class);
        List<FilePart> files = List.of(file);
        List<String> labels = List.of("Salon");

        when(propertyRepo.findById(1L)).thenReturn(Mono.just(property));
        when(imageRepo.deleteByPropertyId(1L)).thenReturn(Mono.empty());
        when(storagePort.store(any(FilePart.class), eq("1"))).thenReturn(Mono.just("/virtual-tours/1/test.jpg"));
        when(imageRepo.save(any())).thenReturn(Mono.just(new VirtualTourImage()));

        StepVerifier.create(virtualTourService.uploadImages(1L, 2L, files, labels))
                .expectNextCount(1)
                .verifyComplete();
    }

    @Test
    void uploadImages_Fails_WhenNotOwner() {
        FilePart file = mock(FilePart.class);
        List<FilePart> files = List.of(file);
        List<String> labels = List.of("Salon");

        when(propertyRepo.findById(1L)).thenReturn(Mono.just(property));

        StepVerifier.create(virtualTourService.uploadImages(1L, 3L, files, labels))
                .expectErrorMatches(t -> t instanceof BusinessException
                        && ((BusinessException) t).getErrorCode().equals("AUTHORIZATION_ERROR"))
                .verify();
    }
}
