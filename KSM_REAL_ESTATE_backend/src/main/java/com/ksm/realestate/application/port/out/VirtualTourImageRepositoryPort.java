package com.ksm.realestate.application.port.out;

import com.ksm.realestate.domain.model.VirtualTourImage;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Outbound port for virtual tour images persistence operations.
 *
 * @author ulrich675
 * @date 2026-07-17
 */
public interface VirtualTourImageRepositoryPort {

    Flux<VirtualTourImage> findByPropertyId(Long propertyId);

    Mono<VirtualTourImage> save(VirtualTourImage image);

    Mono<Void> deleteByPropertyId(Long propertyId);
}
