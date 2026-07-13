package com.ksm.realestate.application.port.in;

import com.ksm.realestate.domain.model.Property;
import com.ksm.realestate.domain.spec.PropertySpecification;
import reactor.core.publisher.Flux;

/**
 * Use‑case for advanced property search.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
public interface SearchPropertiesUseCase {
    /**
     * Search properties matching a specification.
     *
     * @param specification search criteria
     * @return a Flux of Property domain models
     */
    Flux<Property> search(PropertySpecification specification);
}
