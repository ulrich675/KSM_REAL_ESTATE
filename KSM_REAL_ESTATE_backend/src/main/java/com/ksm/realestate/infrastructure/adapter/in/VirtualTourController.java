package com.ksm.realestate.infrastructure.adapter.in;

import com.ksm.realestate.infrastructure.adapter.in.ApiResponse;
import com.ksm.realestate.application.dto.response.VirtualTourImageResponse;
import com.ksm.realestate.application.port.in.GetVirtualTourUseCase;
import com.ksm.realestate.application.port.in.UploadVirtualTourImagesUseCase;
import com.ksm.realestate.domain.exception.BusinessException;
import com.ksm.realestate.infrastructure.mapper.VirtualTourImageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * REST controller for virtual tour operations.
 *
 * @author ulrich675
 * @date 2026-07-17
 */
@RestController
@RequestMapping("/api/properties/{id}/virtual-tour")
@RequiredArgsConstructor
public class VirtualTourController {

    private final GetVirtualTourUseCase getVirtualTourUseCase;
    private final UploadVirtualTourImagesUseCase uploadVirtualTourImagesUseCase;
    private final VirtualTourImageMapper mapper;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public Mono<ResponseEntity<ApiResponse<List<VirtualTourImageResponse>>>> getVirtualTour(
            @PathVariable("id") Long propertyId) {
        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .map(Authentication::getName)
                .flatMap(userIdStr -> {
                    Long userId = Long.parseLong(userIdStr);
                    return getVirtualTourUseCase.getVirtualTour(propertyId, userId)
                            .map(mapper::toResponse)
                            .collectList()
                            .map(images -> ResponseEntity.ok(ApiResponse.<List<VirtualTourImageResponse>>builder()
                                    .status("SUCCESS")
                                    .data(images)
                                    .timestamp(java.time.Instant.now())
                                    .build()))
                            .onErrorResume(e -> {
                                if (e instanceof com.ksm.realestate.domain.exception.VirtualTourNotPurchasedException) {
                                    return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN)
                                            .body(ApiResponse.<List<VirtualTourImageResponse>>builder()
                                                    .status("ERROR")
                                                    .message(e.getMessage())
                                                    .timestamp(java.time.Instant.now())
                                                    .build()));
                                }
                                return Mono.error(e);
                            });
                });
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PROPRIETOR', 'ADMIN')")
    public Mono<ResponseEntity<ApiResponse<List<VirtualTourImageResponse>>>> uploadVirtualTour(
            @PathVariable("id") Long propertyId,
            @RequestPart("files") Flux<FilePart> fileFlux,
            @RequestPart("roomLabels") List<String> roomLabels) {

        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .map(Authentication::getName)
                .flatMap(userIdStr -> {
                    Long userId = Long.parseLong(userIdStr);
                    return fileFlux.collectList()
                            .flatMap(files -> uploadVirtualTourImagesUseCase
                                    .uploadImages(propertyId, userId, files, roomLabels)
                                    .map(mapper::toResponse)
                                    .collectList()
                                    .map(images -> ResponseEntity
                                            .ok(ApiResponse.<List<VirtualTourImageResponse>>builder()
                                                    .status("SUCCESS")
                                                    .data(images)
                                                    .timestamp(java.time.Instant.now())
                                                    .build())));
                })
                .onErrorResume(e -> {
                    if (e instanceof BusinessException
                            && ((BusinessException) e).getErrorCode().equals("AUTHORIZATION_ERROR")) {
                        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(ApiResponse.<List<VirtualTourImageResponse>>builder()
                                        .status("ERROR")
                                        .message(e.getMessage())
                                        .timestamp(java.time.Instant.now())
                                        .build()));
                    }
                    return Mono.error(e);
                });
    }
}
