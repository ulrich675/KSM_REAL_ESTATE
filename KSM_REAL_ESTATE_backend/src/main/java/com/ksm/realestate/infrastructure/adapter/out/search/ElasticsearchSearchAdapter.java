package com.ksm.realestate.infrastructure.adapter.out.search;

import com.ksm.realestate.application.port.out.SearchPort;
import com.ksm.realestate.domain.model.Property;
import org.springframework.data.elasticsearch.core.ReactiveElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

/**
 * Adapter implementing SearchPort using ReactiveElasticsearchOperations.
 *
 * @author Antigravity
 * @date 2026-07-08
 */
@Component
public class ElasticsearchSearchAdapter implements SearchPort {

    private final ReactiveElasticsearchOperations operations;

    public ElasticsearchSearchAdapter(ReactiveElasticsearchOperations operations) {
        this.operations = operations;
    }

    @Override
    public Flux<Property> search(String query) {
        Criteria criteria = new Criteria("title").contains(query)
                .or(new Criteria("description").contains(query));
        Query searchQuery = new CriteriaQuery(criteria);

        return operations.search(searchQuery, Property.class)
                .map(SearchHit::getContent);
    }
}
