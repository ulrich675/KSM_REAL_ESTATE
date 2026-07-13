package com.ksm.realestate.application.port.out;

import com.ksm.realestate.domain.model.Payment;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Outbound port for payment persistence operations.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
public interface PaymentRepositoryPort {

    Mono<Payment> save(Payment payment);

    Mono<Payment> findById(Long paymentId);

    Flux<Payment> findAll();

    Mono<Void> deleteById(Long paymentId);
}
