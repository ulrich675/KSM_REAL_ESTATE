package com.ksm.realestate.application.port.in;

import com.ksm.realestate.domain.model.Property;
import reactor.core.publisher.Mono;

/**
 * Use‑case for updating an existing property.
 */
public interface UpdatePropertyUseCase {
    /**
     * Update a property.
     *
     * @param propertyId the identifier of the property to update
     * @param property   the property data to apply
     * @return the updated property
     */
    Mono<Property> update(Long propertyId, Property property);
}
