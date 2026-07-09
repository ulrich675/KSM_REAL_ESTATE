package com.ksm.realestate.infrastructure.adapter.out.persistence;

import com.ksm.realestate.application.port.out.PaymentRepositoryPort;
import com.ksm.realestate.domain.model.Payment;
import com.ksm.realestate.infrastructure.mapper.PaymentMapper;
import com.ksm.realestate.infrastructure.repository.PaymentRepository;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Adapter that bridges the domain {@link PaymentRepositoryPort} with the Spring
 * Data R2DBC
 * {@link PaymentRepository}. It converts between domain objects and persistence
 * entities using
 * {@link PaymentMapper}.
 */
@Component
public class PaymentRepositoryAdapter implements PaymentRepositoryPort {

    private final PaymentRepository repository;
    private final PaymentMapper mapper;

    public PaymentRepositoryAdapter(PaymentRepository repository, PaymentMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public Mono<Payment> save(Payment payment) {
        return repository.save(mapper.toEntity(payment))
                .map(mapper::toDomain);
    }

    @Override
    public Mono<Payment> findById(Long paymentId) {
        return repository.findById(paymentId)
                .map(mapper::toDomain);
    }

    @Override
    public Flux<Payment> findAll() {
        return repository.findAll()
                .map(mapper::toDomain);
    }

    @Override
    public Mono<Void> deleteById(Long paymentId) {
        return repository.deleteById(paymentId);
    }
}
