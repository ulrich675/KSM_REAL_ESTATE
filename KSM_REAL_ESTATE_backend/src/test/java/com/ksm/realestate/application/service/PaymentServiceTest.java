package com.ksm.realestate.application.service;

import com.ksm.realestate.application.port.out.KernelCorePaymentPort;
import com.ksm.realestate.application.port.out.PaymentRepositoryPort;
import com.ksm.realestate.application.port.out.ReceiptGeneratorPort;
import com.ksm.realestate.domain.model.KernelPaymentResult;
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
    public void testProcessPayment_DelegatesKernelAndPersists() {
        KernelPaymentResult kernelResult = KernelPaymentResult.builder()
                .status("COMPLETED")
                .paymentId("kernel-pay-123")
                .receiptReference("ref-abc")
                .build();

        Mockito.when(kernelCorePaymentPort.processPayment(any(Payment.class)))
                .thenReturn(Mono.just(kernelResult));

        // Return the exact argument passed to save() so mutations are visible
        Mockito.when(paymentRepositoryPort.save(any(Payment.class)))
                .thenAnswer(invocation -> Mono.just((Payment) invocation.getArgument(0)));
        Mockito.when(receiptGeneratorPort.generateReceipt(any(Payment.class)))
                .thenReturn(Mono.just("/receipts/receipt-1.pdf"));

        Payment incoming = new Payment();
        incoming.setAmount(BigDecimal.valueOf(250000));
        incoming.setCurrency("XAF");

        StepVerifier.create(paymentService.process(incoming))
                .expectNextMatches(pay -> "COMPLETED".equals(pay.getStatus())
                        && pay.getPaidAt() != null
                        && "/receipts/receipt-1.pdf".equals(pay.getReceiptPdfUrl()))
                .verifyComplete();
    }
}