package com.ksm.realestate.infrastructure.repository;

import com.ksm.realestate.infrastructure.entity.VirtualTourImageEntity;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Reactive CRUD repository for VirtualTourImageEntity.
 *
 * @author ulrich675
 * @date 2026-07-17
 */
public interface VirtualTourImageRepository extends ReactiveCrudRepository<VirtualTourImageEntity, Long> {

    Flux<VirtualTourImageEntity> findByPropertyIdOrderByDisplayOrderAsc(Long propertyId);

    Mono<Void> deleteByPropertyId(Long propertyId);
}
