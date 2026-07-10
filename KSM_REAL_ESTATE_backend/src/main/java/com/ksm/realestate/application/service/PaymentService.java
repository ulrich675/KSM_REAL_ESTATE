package com.ksm.realestate.application.service;

import com.ksm.realestate.application.port.in.ProcessPaymentUseCase;
import com.ksm.realestate.application.port.out.KernelCorePaymentPort;
import com.ksm.realestate.application.port.out.PaymentRepositoryPort;
import com.ksm.realestate.application.port.out.ReceiptGeneratorPort;
import com.ksm.realestate.domain.model.KernelInvoiceCommand;
import com.ksm.realestate.domain.model.Payment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Instant;

/**
 * PaymentService orchestrates payment processing by:
 * 1. Delegating invoice creation to kernel-core accounting (billing-core).
 * 2. Persisting the local Payment record once the kernel invoice is created.
 * 3. Generating a PDF receipt for COMPLETED payments.
 *
 * <p>
 * Endpoint used: POST /api/accounting/invoices → POST
 * /api/accounting/invoices/{id}/post
 *
 * @author Antigravity
 * @date 2026-07-10
 */
@Service
@RequiredArgsConstructor
public class PaymentService implements ProcessPaymentUseCase {

    private final PaymentRepositoryPort repositoryPort;
    private final ReceiptGeneratorPort receiptGeneratorPort;
    private final KernelCorePaymentPort kernelCorePaymentPort;

    @Override
    public Mono<Payment> process(Payment payment) {
        // Build the invoice command from the local Payment domain object
        KernelInvoiceCommand invoiceCmd = KernelInvoiceCommand.builder()
                // customerThirdPartyId: use the userId as a string reference
                // (must be a valid UUID in kernel-core; production: map to actorId from User
                // cache)
                .customerThirdPartyId(String.valueOf(payment.getUserId()))
                .currency(payment.getCurrency() != null ? payment.getCurrency() : "XAF")
                .productId(payment.getPropertyId() != null ? payment.getPropertyId().toString() : null)
                .unitPrice(payment.getAmount() != null ? payment.getAmount().doubleValue() : 0.0)
                .quantity(1.0)
                .build();

        return kernelCorePaymentPort.createInvoice(invoiceCmd)
                .flatMap(invoiceResult -> {
                    payment.setPaidAt(Instant.now());
                    // Map kernel invoice status to local payment status
                    payment.setStatus(invoiceResult.getStatus() != null ? invoiceResult.getStatus() : "COMPLETED");
                    // Store kernel invoice reference for traceability
                    if (payment.getReceiptPdfUrl() == null && invoiceResult.getInvoiceId() != null) {
                        payment.setReceiptPdfUrl("/kernel/invoices/" + invoiceResult.getInvoiceId());
                    }

                    return repositoryPort.save(payment)
                            .flatMap(saved -> {
                                if ("COMPLETED".equals(saved.getStatus()) || "POSTED".equals(saved.getStatus())) {
                                    return receiptGeneratorPort.generateReceipt(saved)
                                            .flatMap(receiptUrl -> {
                                                saved.setReceiptPdfUrl(receiptUrl);
                                                return repositoryPort.save(saved);
                                            });
                                }
                                return Mono.just(saved);
                            });
                });
    }
}