package com.ksm.realestate.application.port.out;

import com.ksm.realestate.domain.model.KernelPaymentResult;
import com.ksm.realestate.domain.model.Payment;
import reactor.core.publisher.Mono;

/**
 * Outbound port for delegation of payment processing services.
 *
 * @author Antigravity
 * @date 2026-07-09
 */
public interface KernelCorePaymentPort {

    /**
     * Delegates payment processing to the external billing-core.
     *
     * @param payment the billing and amount details
     * @return the simulated/actual payment execution receipt
     */
    Mono<KernelPaymentResult> processPayment(Payment payment);
}
