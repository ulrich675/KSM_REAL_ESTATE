package com.ksm.realestate.infrastructure.repository;

import com.ksm.realestate.infrastructure.entity.ProprietorRequestEntity;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface ProprietorRequestRepository extends ReactiveCrudRepository<ProprietorRequestEntity, Long> {
    Flux<ProprietorRequestEntity> findByStatus(String status);

    Flux<ProprietorRequestEntity> findByUserId(Long userId);
}
