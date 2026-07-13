package com.ksm.realestate.infrastructure.repository;

import com.ksm.realestate.infrastructure.entity.CommentEntity;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

/**
 * Spring Data R2DBC reactive repository for CommentEntity.
 *
 * @author ulrich675
 * @date 2026-07-09
 */
public interface CommentRepository extends ReactiveCrudRepository<CommentEntity, Long> {
    Flux<CommentEntity> findByPropertyId(Long propertyId);

    Flux<CommentEntity> findByUserId(Long userId);
}
