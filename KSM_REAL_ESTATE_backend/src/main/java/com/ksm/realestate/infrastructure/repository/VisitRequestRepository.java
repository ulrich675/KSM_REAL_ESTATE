package com.ksm.realestate.infrastructure.repository;

import com.ksm.realestate.infrastructure.entity.VisitRequestEntity;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

/**
 * Reactive CRUD repository for VisitRequestEntity.
 */
public interface VisitRequestRepository extends ReactiveCrudRepository<VisitRequestEntity, Long> {
    Flux<VisitRequestEntity> findByUserId(Long userId);

    Flux<VisitRequestEntity> findByPropertyId(Long propertyId);
}
