package com.ksm.realestate.application.port.out;

import com.ksm.realestate.domain.model.Property;
import com.ksm.realestate.domain.spec.PropertySpecification;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Outbound port for property persistence operations.
 *
 * @author Antigravity
 * @date 2026-07-08
 */
public interface PropertyRepositoryPort {

    Mono<Property> save(Property property);

    Mono<Property> findById(Long propertyId);

    Flux<Property> findAll();

    Mono<Void> deleteById(Long propertyId);

    Flux<Property> search(PropertySpecification specification);
}
