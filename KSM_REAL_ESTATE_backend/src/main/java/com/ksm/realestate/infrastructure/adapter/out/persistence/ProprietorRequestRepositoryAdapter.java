package com.ksm.realestate.infrastructure.adapter.out.persistence;

import com.ksm.realestate.application.port.out.ProprietorRequestRepositoryPort;
import com.ksm.realestate.domain.model.ProprietorRequest;
import com.ksm.realestate.domain.model.ProprietorRequestStatus;
import com.ksm.realestate.infrastructure.mapper.ProprietorRequestMapper;
import com.ksm.realestate.infrastructure.repository.ProprietorRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class ProprietorRequestRepositoryAdapter implements ProprietorRequestRepositoryPort {

    private final ProprietorRequestRepository repository;
    private final ProprietorRequestMapper mapper;

    @Override
    public Mono<ProprietorRequest> save(ProprietorRequest request) {
        return repository.save(mapper.toEntity(request))
                .map(mapper::toDomain);
    }

    @Override
    public Mono<ProprietorRequest> findById(Long id) {
        return repository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Flux<ProprietorRequest> findAll() {
        return repository.findAll().map(mapper::toDomain);
    }

    @Override
    public Flux<ProprietorRequest> findByStatus(ProprietorRequestStatus status) {
        return repository.findByStatus(status.name()).map(mapper::toDomain);
    }

    @Override
    public Flux<ProprietorRequest> findByUserId(Long userId) {
        return repository.findByUserId(userId).map(mapper::toDomain);
    }
}
