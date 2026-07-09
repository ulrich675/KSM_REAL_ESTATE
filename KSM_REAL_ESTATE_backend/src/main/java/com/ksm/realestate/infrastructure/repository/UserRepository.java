package com.ksm.realestate.infrastructure.repository;

import com.ksm.realestate.infrastructure.entity.UserEntity;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

/**
 * Reactive CRUD repository for UserEntity.
 */
public interface UserRepository extends ReactiveCrudRepository<UserEntity, Long> {
    Flux<UserEntity> findByEmail(String email);
}
