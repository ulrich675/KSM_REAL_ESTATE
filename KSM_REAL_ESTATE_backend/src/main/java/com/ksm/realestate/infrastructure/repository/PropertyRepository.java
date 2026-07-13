package com.ksm.realestate.infrastructure.repository;

import com.ksm.realestate.infrastructure.entity.PropertyEntity;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

/**
 * Reactive CRUD repository for PropertyEntity.
 *
 * Spring Data R2DBC will provide the implementation at runtime.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
public interface PropertyRepository extends ReactiveCrudRepository<PropertyEntity, Long> {
    // Additional query methods can be defined here if needed, e.g., findByCategory,
    // findByOwnerId, etc.
    Flux<PropertyEntity> findByCategory(String category);
}
