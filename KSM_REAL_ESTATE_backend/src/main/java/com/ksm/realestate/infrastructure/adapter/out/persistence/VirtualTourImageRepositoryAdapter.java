package com.ksm.realestate.infrastructure.adapter.out.persistence;

import com.ksm.realestate.application.port.out.VirtualTourImageRepositoryPort;
import com.ksm.realestate.domain.model.VirtualTourImage;
import com.ksm.realestate.infrastructure.mapper.VirtualTourImageMapper;
import com.ksm.realestate.infrastructure.repository.VirtualTourImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Adapter that bridges VirtualTourImageRepositoryPort with Spring Data R2DBC.
 *
 * @author ulrich675
 * @date 2026-07-17
 */
@Component
@RequiredArgsConstructor
public class VirtualTourImageRepositoryAdapter implements VirtualTourImageRepositoryPort {

    private final VirtualTourImageRepository repository;
    private final VirtualTourImageMapper mapper;

    @Override
    public Flux<VirtualTourImage> findByPropertyId(Long propertyId) {
        return repository.findByPropertyIdOrderByDisplayOrderAsc(propertyId)
                .map(mapper::toDomain);
    }

    @Override
    public Mono<VirtualTourImage> save(VirtualTourImage image) {
        return repository.save(mapper.toEntity(image))
                .map(mapper::toDomain);
    }

    @Override
    public Mono<Void> deleteByPropertyId(Long propertyId) {
        return repository.deleteByPropertyId(propertyId);
    }
}
