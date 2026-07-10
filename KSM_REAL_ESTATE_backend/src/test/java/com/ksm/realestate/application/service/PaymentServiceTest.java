package com.ksm.realestate.application.service;

import com.ksm.realestate.application.port.out.KernelCorePaymentPort;
import com.ksm.realestate.application.port.out.PaymentRepositoryPort;
import com.ksm.realestate.application.port.out.ReceiptGeneratorPort;
import com.ksm.realestate.domain.model.KernelInvoiceResult;
import com.ksm.realestate.domain.model.Payment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;

/**
 * Unit tests for PaymentService using the updated KernelCorePaymentPort
 * (createInvoice → KernelInvoiceResult).
 *
 * @author Antigravity
 * @date 2026-07-10
 */
@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

        @Mock
        private PaymentRepositoryPort paymentRepositoryPort;

        @Mock
        private ReceiptGeneratorPort receiptGeneratorPort;

        @Mock
        private KernelCorePaymentPort kernelCorePaymentPort;

        private PaymentService paymentService;

        @BeforeEach
        public void setUp() {
                paymentService = new PaymentService(paymentRepositoryPort, receiptGeneratorPort, kernelCorePaymentPort);
        }

        @Test
        public void testProcessPayment_DelegatesKernelInvoiceAndPersists() {
                KernelInvoiceResult invoiceResult = KernelInvoiceResult.builder()
                                .invoiceId("inv-kernel-123")
                                .invoiceNumber("INV-2026-001")
                                .status("COMPLETED")
                                .paymentStatus("SETTLED")
                                .totalAmount(250000.0)
                                .currency("XAF")
                                .build();

                Mockito.when(kernelCorePaymentPort.createInvoice(any()))
                                .thenReturn(Mono.just(invoiceResult));

                Mockito.when(paymentRepositoryPort.save(any(Payment.class)))
                                .thenAnswer(invocation -> Mono.just((Payment) invocation.getArgument(0)));
                Mockito.when(receiptGeneratorPort.generateReceipt(any(Payment.class)))
                                .thenReturn(Mono.just("/receipts/receipt-1.pdf"));

                Payment incoming = new Payment();
                incoming.setUserId(1L);
                incoming.setPropertyId(10L);
                incoming.setAmount(BigDecimal.valueOf(250000));
                incoming.setCurrency("XAF");

                StepVerifier.create(paymentService.process(incoming))
                                .expectNextMatches(pay -> "COMPLETED".equals(pay.getStatus())
                                                && pay.getPaidAt() != null
                                                && "/receipts/receipt-1.pdf".equals(pay.getReceiptPdfUrl()))
                                .verifyComplete();
        }
}