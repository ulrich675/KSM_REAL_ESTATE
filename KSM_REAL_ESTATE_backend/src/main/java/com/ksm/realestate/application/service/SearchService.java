package com.ksm.realestate.application.service;

import com.ksm.realestate.application.port.in.SearchUseCase;
import com.ksm.realestate.application.port.out.SearchPort;
import com.ksm.realestate.domain.model.Property;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;

/**
 * SearchService processes property search use‑cases using external indexing
 * adapters (like Elasticsearch).
 *
 * @author ulrich675
 * @date 2026-07-08
 */
@Service
@RequiredArgsConstructor
public class SearchService implements SearchUseCase {

    private final SearchPort searchPort;

    @Override
    public Flux<Property> search(String query) {
        return searchPort.search(query);
    }
}
