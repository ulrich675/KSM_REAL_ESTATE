package com.ksm.realestate.infrastructure.adapter.out.persistence;

import com.ksm.realestate.application.port.out.VisitRequestRepositoryPort;
import com.ksm.realestate.domain.model.VisitRequest;
import com.ksm.realestate.infrastructure.mapper.VisitRequestMapper;
import com.ksm.realestate.infrastructure.repository.VisitRequestRepository;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Adapter that bridges the domain {@link VisitRequestRepositoryPort} with the
 * Spring Data R2DBC
 * {@link VisitRequestRepository}. It converts between domain objects and
 * persistence entities using
 * {@link VisitRequestMapper}.
 */
@Component
public class VisitRequestRepositoryAdapter implements VisitRequestRepositoryPort {

    private final VisitRequestRepository repository;
    private final VisitRequestMapper mapper;

    public VisitRequestRepositoryAdapter(VisitRequestRepository repository, VisitRequestMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public Mono<VisitRequest> save(VisitRequest request) {
        return repository.save(mapper.toEntity(request))
                .map(mapper::toDomain);
    }

    @Override
    public Mono<VisitRequest> findById(Long requestId) {
        return repository.findById(requestId)
                .map(mapper::toDomain);
    }

    @Override
    public Flux<VisitRequest> findAll() {
        return repository.findAll()
                .map(mapper::toDomain);
    }

    @Override
    public Mono<Void> deleteById(Long requestId) {
        return repository.deleteById(requestId);
    }
}
