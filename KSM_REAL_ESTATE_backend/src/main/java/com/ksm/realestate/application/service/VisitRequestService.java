package com.ksm.realestate.application.service;

import com.ksm.realestate.application.port.in.CreateVisitRequestUseCase;
import com.ksm.realestate.application.port.out.VisitRequestRepositoryPort;
import com.ksm.realestate.domain.model.VisitRequest;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;
import java.time.Instant;

/**
 * VisitRequestService provides business logic for handling property visit
 * requests.
 *
 * @author Antigravity
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
}
