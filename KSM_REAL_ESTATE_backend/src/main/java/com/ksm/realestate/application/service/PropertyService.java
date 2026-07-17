package com.ksm.realestate.application.service;

import com.ksm.realestate.application.port.in.CreatePropertyUseCase;
import com.ksm.realestate.application.port.in.DeletePropertyUseCase;
import com.ksm.realestate.application.port.in.GetPropertyUseCase;
import com.ksm.realestate.application.port.in.UpdatePropertyUseCase;
import com.ksm.realestate.application.port.in.SearchPropertiesUseCase;
import com.ksm.realestate.application.port.out.PropertyRepositoryPort;
import com.ksm.realestate.application.port.out.SearchPort;
import com.ksm.realestate.domain.exception.PropertyNotFoundException;
import com.ksm.realestate.domain.model.Property;
import com.ksm.realestate.domain.spec.PropertySpecification;
import com.ksm.realestate.application.port.out.UserRepositoryPort;
import com.ksm.realestate.application.dto.response.OwnerSummaryResponse;
import com.ksm.realestate.domain.model.User;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import lombok.RequiredArgsConstructor;
import java.time.Instant;

/**
 * PropertyService provides the business logic for property management,
 * implementing the inbound use-case ports.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
@Service
@RequiredArgsConstructor
public class PropertyService implements
        CreatePropertyUseCase,
        GetPropertyUseCase,
        UpdatePropertyUseCase,
        DeletePropertyUseCase,
        SearchPropertiesUseCase {

    private final PropertyRepositoryPort propertyRepositoryPort;
    private final SearchPort searchPort;
    private final UserRepositoryPort userRepositoryPort;

    @Override
    public Mono<Property> create(Property property) {
        Instant now = Instant.now();
        property.setCreatedAt(now);
        property.setUpdatedAt(now);
        return propertyRepositoryPort.save(property);
    }

    public Mono<OwnerSummaryResponse> getOwnerSummary(Long propertyId) {
        return getById(propertyId)
                .switchIfEmpty(Mono.error(new PropertyNotFoundException(propertyId)))
                .flatMap(property -> userRepositoryPort.findById(property.getOwnerId()))
                .map(user -> {
                    String fullName = (user.getFirstName() != null ? user.getFirstName() : "") + " " +
                            (user.getLastName() != null ? user.getLastName() : "");
                    return OwnerSummaryResponse.builder()
                            .id(user.getUserId())
                            .nom(fullName.trim())
                            .numero(user.getPhoneNumber())
                            .email(user.getEmail())
                            .note(4.8) // Mock rating
                            .build();
                });
    }

    @Override
    public Mono<Property> getById(Long propertyId) {
        return propertyRepositoryPort.findById(propertyId);
    }

    @Override
    public Mono<Property> update(Long propertyId, Property property) {
        return propertyRepositoryPort.findById(propertyId)
                .switchIfEmpty(Mono.error(
                        new PropertyNotFoundException(propertyId)))
                .flatMap(existing -> {
                    property.setPropertyId(propertyId);
                    property.setOwnerId(existing.getOwnerId());
                    property.setCreatedAt(existing.getCreatedAt());
                    property.setUpdatedAt(Instant.now());
                    return propertyRepositoryPort.save(property);
                });
    }

    @Override
    public Mono<Void> delete(Long propertyId) {
        return propertyRepositoryPort.deleteById(propertyId);
    }

    @Override
    public Flux<Property> search(PropertySpecification specification) {
        return propertyRepositoryPort.search(specification);
    }

    // Retransmit old service method names as redirects/delegators if needed for
    // UserController or other consumers
    public Mono<Property> createProperty(Property property) {
        return create(property);
    }

    public Mono<Property> getPropertyById(Long propertyId) {
        return getById(propertyId);
    }

    public Mono<Property> updateProperty(Property property) {
        return update(property.getPropertyId(), property);
    }

    public Mono<Void> deleteProperty(Long propertyId) {
        return delete(propertyId);
    }

    public Flux<Property> searchProperties(PropertySpecification specification) {
        return search(specification);
    }
}