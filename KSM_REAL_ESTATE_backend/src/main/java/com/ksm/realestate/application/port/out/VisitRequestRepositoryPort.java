package com.ksm.realestate.application.port.out;

import com.ksm.realestate.domain.model.VisitRequest;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Outbound port for visit request persistence operations.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
public interface VisitRequestRepositoryPort {

    Mono<VisitRequest> save(VisitRequest request);

    Mono<VisitRequest> findById(Long requestId);

    Flux<VisitRequest> findAll();

    Mono<Void> deleteById(Long requestId);
}
