package com.ksm.realestate.application.port.out;

import com.ksm.realestate.domain.model.Payment;
import reactor.core.publisher.Mono;

/**
 * Outbound port for generating a payment receipt document.
 *
 * @author Antigravity
 * @date 2026-07-08
 */
public interface ReceiptGeneratorPort {

    /**
     * Generate a receipt document for the given payment.
     *
     * @param payment the completed payment
     * @return the URL (or relative path) where the generated receipt can be
     *         retrieved
     */
    Mono<String> generateReceipt(Payment payment);
}