package com.ksm.realestate.infrastructure.repository;

import com.ksm.realestate.infrastructure.entity.PaymentEntity;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

/**
 * Reactive CRUD repository for PaymentEntity.
 */
public interface PaymentRepository extends ReactiveCrudRepository<PaymentEntity, Long> {
    Flux<PaymentEntity> findByUserId(Long userId);

    Flux<PaymentEntity> findByPropertyId(Long propertyId);
}
