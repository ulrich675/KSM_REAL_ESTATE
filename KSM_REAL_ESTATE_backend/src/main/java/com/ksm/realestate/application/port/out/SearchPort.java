package com.ksm.realestate.application.port.out;

import com.ksm.realestate.domain.model.Property;
import reactor.core.publisher.Flux;

/**
 * Outbound port for search operations (e.g., Elasticsearch).
 *
 * Provides a reactive stream of search results based on a query string.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
public interface SearchPort {

    /**
     * Search for properties matching the given query.
     *
     * @param query the search query string
     * @return a Flux of matching Property objects
     */
    Flux<Property> search(String query);
}
