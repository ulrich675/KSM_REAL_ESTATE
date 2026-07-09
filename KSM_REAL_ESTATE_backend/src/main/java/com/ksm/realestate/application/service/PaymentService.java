package com.ksm.realestate.application.service;

import com.ksm.realestate.application.port.in.ProcessPaymentUseCase;
import com.ksm.realestate.application.port.out.KernelCorePaymentPort;
import com.ksm.realestate.application.port.out.PaymentRepositoryPort;
import com.ksm.realestate.application.port.out.ReceiptGeneratorPort;
import com.ksm.realestate.domain.model.Payment;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;
import java.time.Instant;

/**
 * PaymentService handles payment processing for properties,
 * delegating execution to the external billing-core.
 *
 * @author Antigravity
 * @date 2026-07-09
 */
@Service
@RequiredArgsConstructor
public class PaymentService implements ProcessPaymentUseCase {

    private final PaymentRepositoryPort repositoryPort;
    private final ReceiptGeneratorPort receiptGeneratorPort;
    private final KernelCorePaymentPort kernelCorePaymentPort;

    @Override
    public Mono<Payment> process(Payment payment) {
        return kernelCorePaymentPort.processPayment(payment)
                .flatMap(result -> {
                    payment.setPaidAt(Instant.now());
                    payment.setStatus(result.getStatus());

                    return repositoryPort.save(payment)
                            .flatMap(savedPayment -> {
                                if ("COMPLETED".equals(savedPayment.getStatus())) {
                                    return receiptGeneratorPort.generateReceipt(savedPayment)
                                            .flatMap(receiptUrl -> {
                                                savedPayment.setReceiptPdfUrl(receiptUrl);
                                                return repositoryPort.save(savedPayment);
                                            });
                                }
                                return Mono.just(savedPayment);
                            });
                });
    }
}