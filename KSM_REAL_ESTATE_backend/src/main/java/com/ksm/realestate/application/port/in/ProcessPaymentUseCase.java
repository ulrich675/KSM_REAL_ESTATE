package com.ksm.realestate.application.port.in;

import com.ksm.realestate.domain.model.Payment;
import reactor.core.publisher.Mono;

/**
 * Use‑case for processing a mock payment transaction.
 *
 * @author Antigravity
 * @date 2026-07-08
 */
public interface ProcessPaymentUseCase {
    /**
     * Process a simulated payment.
     *
     * @param payment the payment details
     * @return the processed payment with status/receipt info
     */
    Mono<Payment> process(Payment payment);
}
