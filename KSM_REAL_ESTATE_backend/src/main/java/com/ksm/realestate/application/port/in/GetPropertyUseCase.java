package com.ksm.realestate.application.port.in;

import com.ksm.realestate.domain.model.Property;
import reactor.core.publisher.Mono;

/**
 * Use‑case for retrieving a property by its identifier.
 */
public interface GetPropertyUseCase {
    /**
     * Find a property.
     *
     * @param propertyId the identifier of the property
     * @return the property if found, otherwise empty Mono
     */
    Mono<Property> getById(Long propertyId);
}
