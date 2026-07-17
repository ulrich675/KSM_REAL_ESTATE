package com.ksm.realestate.application.port.out;

import com.ksm.realestate.domain.model.ProprietorRequest;
import com.ksm.realestate.domain.model.ProprietorRequestStatus;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ProprietorRequestRepositoryPort {
    Mono<ProprietorRequest> save(ProprietorRequest request);

    Mono<ProprietorRequest> findById(Long id);

    Flux<ProprietorRequest> findAll();

    Flux<ProprietorRequest> findByStatus(ProprietorRequestStatus status);

    Flux<ProprietorRequest> findByUserId(Long userId);
}
