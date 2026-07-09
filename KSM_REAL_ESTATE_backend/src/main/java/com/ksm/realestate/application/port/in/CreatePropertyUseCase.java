package com.ksm.realestate.application.port.in;

import com.ksm.realestate.domain.model.Property;
import reactor.core.publisher.Mono;

/**
 * Use‑case for creating a new property.
 */
public interface CreatePropertyUseCase {
    /**
     * Create a property.
     *
     * @param property the property to create
     * @return the created property with generated identifier
     */
    Mono<Property> create(Property property);
}
