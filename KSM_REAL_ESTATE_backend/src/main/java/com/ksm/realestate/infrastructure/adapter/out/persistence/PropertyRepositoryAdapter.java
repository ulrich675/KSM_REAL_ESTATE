package com.ksm.realestate.infrastructure.adapter.out.persistence;

import com.ksm.realestate.application.port.out.PropertyRepositoryPort;
import com.ksm.realestate.domain.model.Property;
import com.ksm.realestate.domain.spec.PropertySpecification;
import com.ksm.realestate.infrastructure.mapper.PropertyMapper;
import com.ksm.realestate.infrastructure.repository.PropertyRepository;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Adapter bridging {@link PropertyRepositoryPort} with R2DBC
 * {@link PropertyRepository}.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
@Component
public class PropertyRepositoryAdapter implements PropertyRepositoryPort {

    private final PropertyRepository repository;
    private final PropertyMapper mapper;

    public PropertyRepositoryAdapter(PropertyRepository repository, PropertyMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public Mono<Property> save(Property property) {
        return repository.save(mapper.toEntity(property))
                .map(mapper::toDomain);
    }

    @Override
    public Mono<Property> findById(Long propertyId) {
        return repository.findById(propertyId)
                .map(mapper::toDomain);
    }

    @Override
    public Flux<Property> findAll() {
        return repository.findAll()
                .map(mapper::toDomain);
    }

    @Override
    public Mono<Void> deleteById(Long propertyId) {
        return repository.deleteById(propertyId);
    }

    @Override
    public Flux<Property> search(PropertySpecification specification) {
        return repository.findAll()
                .map(mapper::toDomain)
                .filter(property -> {
                    if (specification.getCategory() != null
                            && !specification.getCategory().equalsIgnoreCase(property.getCategory())) {
                        return false;
                    }
                    if (specification.getCity() != null && property.getAddress() != null &&
                            !specification.getCity().equalsIgnoreCase(property.getAddress().getCity())) {
                        return false;
                    }
                    return true;
                });
    }
}
