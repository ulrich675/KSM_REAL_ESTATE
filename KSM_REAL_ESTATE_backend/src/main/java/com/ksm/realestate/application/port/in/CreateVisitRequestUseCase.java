package com.ksm.realestate.application.port.in;

import com.ksm.realestate.domain.model.VisitRequest;
import reactor.core.publisher.Mono;

/**
 * Use‑case for creating a visit request.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
public interface CreateVisitRequestUseCase {
    /**
     * Submit a visit request for a property.
     *
     * @param request the visit request details
     * @return the saved visit request
     */
    Mono<VisitRequest> create(VisitRequest request);
}
