/**
 * REST controller exposing property management endpoints.
 * Uses reactive types and returns a standardized ApiResponse envelope.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
package com.ksm.realestate.infrastructure.adapter.in;

import com.ksm.realestate.application.dto.request.PropertyCreateRequest;
import com.ksm.realestate.application.dto.response.PropertyResponse;
import com.ksm.realestate.application.service.PropertyService;
import com.ksm.realestate.infrastructure.mapper.PropertyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.time.Instant;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;
    private final PropertyMapper propertyMapper;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse<PropertyResponse>> createProperty(@RequestBody PropertyCreateRequest request) {
        return propertyService.createProperty(propertyMapper.toDomain(request))
                .map(propertyMapper::toResponse)
                .map(response -> ApiResponse.<PropertyResponse>builder()
                        .status("SUCCESS")
                        .message("Property created successfully")
                        .data(response)
                        .timestamp(Instant.now())
                        .errors(null)
                        .build());
    }

    @GetMapping("/{id}")
    public Mono<ApiResponse<PropertyResponse>> getProperty(@PathVariable("id") Long id) {
        return propertyService.getPropertyById(id)
                .map(propertyMapper::toResponse)
                .map(response -> ApiResponse.<PropertyResponse>builder()
                        .status("SUCCESS")
                        .message("Property retrieved")
                        .data(response)
                        .timestamp(Instant.now())
                        .errors(null)
                        .build());
    }

    @PutMapping("/{id}")
    public Mono<ApiResponse<PropertyResponse>> updateProperty(@PathVariable("id") Long id,
            @RequestBody PropertyCreateRequest request) {
        // Ensure the ID is set on the domain object
        return Mono.just(propertyMapper.toDomain(request))
                .doOnNext(prop -> prop.setPropertyId(id))
                .flatMap(propertyService::updateProperty)
                .map(propertyMapper::toResponse)
                .map(response -> ApiResponse.<PropertyResponse>builder()
                        .status("SUCCESS")
                        .message("Property updated")
                        .data(response)
                        .timestamp(Instant.now())
                        .errors(null)
                        .build());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> deleteProperty(@PathVariable("id") Long id) {
        return propertyService.deleteProperty(id);
    }

    @GetMapping
    public Flux<ApiResponse<PropertyResponse>> searchProperties(
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "city", required = false) String city) {
        // Simple specification builder (placeholder)
        com.ksm.realestate.domain.spec.PropertySpecification spec = new com.ksm.realestate.domain.spec.PropertySpecification();
        if (category != null)
            spec.setCategory(category);
        if (city != null)
            spec.setCity(city);
        return propertyService.searchProperties(spec)
                .map(propertyMapper::toResponse)
                .map(response -> ApiResponse.<PropertyResponse>builder()
                        .status("SUCCESS")
                        .message("Property found")
                        .data(response)
                        .timestamp(Instant.now())
                        .errors(null)
                        .build());
    }
}
