package com.ksm.realestate.application.port.in;

import com.ksm.realestate.domain.model.Property;
import reactor.core.publisher.Flux;

/**
 * Use‑case for query‑based property search (Elasticsearch).
 *
 * @author Antigravity
 * @date 2026-07-08
 */
public interface SearchUseCase {
    /**
     * Search properties by keyword query.
     *
     * @param query the search query
     * @return a Flux of matching properties
     */
    Flux<Property> search(String query);
}
