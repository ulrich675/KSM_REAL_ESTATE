package com.ksm.realestate.application.port.in;

import reactor.core.publisher.Mono;

/**
 * Use‑case for deleting a property.
 */
public interface DeletePropertyUseCase {
    /**
     * Delete a property.
     *
     * @param propertyId the identifier of the property to delete
     * @return a Mono signalling completion
     */
    Mono<Void> delete(Long propertyId);
}
