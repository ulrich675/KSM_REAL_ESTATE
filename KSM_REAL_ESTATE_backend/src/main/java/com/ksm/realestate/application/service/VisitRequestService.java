package com.ksm.realestate.application.service;

import com.ksm.realestate.application.port.in.CreateVisitRequestUseCase;
import com.ksm.realestate.application.port.out.VisitRequestRepositoryPort;
import com.ksm.realestate.domain.model.VisitRequest;
import com.ksm.realestate.domain.exception.PropertyNotFoundException;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.time.Instant;

/**
 * VisitRequestService provides business logic for handling property visit
 * requests.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
@Service
@RequiredArgsConstructor
public class VisitRequestService implements CreateVisitRequestUseCase {

    private final VisitRequestRepositoryPort repositoryPort;

    @Override
    public Mono<VisitRequest> create(VisitRequest request) {
        request.setRequestedAt(Instant.now());
        request.setStatus("PENDING");
        return repositoryPort.save(request);
    }

    public Flux<VisitRequest> findAll() {
        return repositoryPort.findAll();
    }

    public Flux<VisitRequest> findByPropertyId(Long propertyId) {
        return repositoryPort.findAll()
                .filter(v -> propertyId.equals(v.getPropertyId()));
    }

    public Flux<VisitRequest> findByUserId(Long userId) {
        return repositoryPort.findAll()
                .filter(v -> userId.equals(v.getUserId()));
    }

    public Mono<VisitRequest> updateStatus(Long id, String status) {
        return repositoryPort.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Visit request not found: " + id)))
                .flatMap(v -> {
                    v.setStatus(status);
                    v.setUpdatedAt(Instant.now());
                    return repositoryPort.save(v);
                });
    }
}
