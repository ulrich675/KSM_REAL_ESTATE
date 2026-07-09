package com.ksm.realestate.infrastructure.adapter.out.kernelcore;

import com.ksm.realestate.domain.exception.KernelCoreException;
import com.ksm.realestate.domain.model.Payment;
import com.ksm.realestate.infrastructure.config.KernelCoreProperties;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.test.StepVerifier;

import java.io.IOException;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Unit tests for KernelCorePaymentAdapter using MockWebServer to simulate
 * kernel-core billing-core HTTP responses without a real network call.
 *
 * @author Antigravity
 * @date 2026-07-09
 */
public class KernelCorePaymentAdapterTest {

    private MockWebServer mockWebServer;
    private KernelCorePaymentAdapter adapter;

    @BeforeEach
    public void setUp() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start();

        KernelCoreProperties properties = new KernelCoreProperties();
        properties.setBaseUrl(mockWebServer.url("/").toString());
        properties.setClientId("test-client");
        properties.setApiKey("test-api-key");
        properties.setTenantId("11111111-1111-1111-1111-111111111111");
        properties.setOrganizationId("22222222-2222-2222-2222-222222222222");

        WebClient webClient = WebClient.builder()
                .baseUrl(properties.getBaseUrl())
                .defaultHeader("X-Client-Id", properties.getClientId())
                .defaultHeader("X-Api-Key", properties.getApiKey())
                .build();

        adapter = new KernelCorePaymentAdapter(webClient, properties);
    }

    @AfterEach
    public void tearDown() throws IOException {
        mockWebServer.shutdown();
    }

    @Test
    public void testProcessPayment_Success() {
        mockWebServer.enqueue(new MockResponse()
                .setResponseCode(200)
                .setBody(
                        "{\"status\":\"SUCCESS\",\"data\":{\"status\":\"COMPLETED\",\"paymentId\":\"pay-123\",\"receiptReference\":\"ref-abc\"}}")
                .addHeader("Content-Type", "application/json"));

        Payment payment = new Payment();
        payment.setUserId(1L);
        payment.setPropertyId(10L);
        payment.setAmount(BigDecimal.valueOf(250000));
        payment.setCurrency("XAF");

        StepVerifier.create(adapter.processPayment(payment))
                .expectNextMatches(result -> "COMPLETED".equals(result.getStatus())
                        && "pay-123".equals(result.getPaymentId())
                        && "ref-abc".equals(result.getReceiptReference()))
                .verifyComplete();
    }

    @Test
    public void testProcessPayment_OrganizationHeaderIsSent() throws InterruptedException {
        mockWebServer.enqueue(new MockResponse()
                .setResponseCode(200)
                .setBody(
                        "{\"status\":\"SUCCESS\",\"data\":{\"status\":\"COMPLETED\",\"paymentId\":\"pay-456\",\"receiptReference\":\"ref-def\"}}")
                .addHeader("Content-Type", "application/json"));

        Payment payment = new Payment();
        payment.setUserId(1L);
        payment.setPropertyId(10L);
        payment.setAmount(BigDecimal.valueOf(100000));
        payment.setCurrency("XAF");

        StepVerifier.create(adapter.processPayment(payment))
                .expectNextMatches(result -> "pay-456".equals(result.getPaymentId()))
                .verifyComplete();

        var recordedRequest = mockWebServer.takeRequest();
        assertEquals("22222222-2222-2222-2222-222222222222", recordedRequest.getHeader("X-Organization-Id"));
        assertEquals("11111111-1111-1111-1111-111111111111", recordedRequest.getHeader("X-Tenant-Id"));
    }

    @Test
    public void testProcessPayment_QuotaExceededMapsToKernelCoreException() {
        mockWebServer.enqueue(new MockResponse()
                .setResponseCode(429)
                .setBody("{\"errorCode\":\"TENANT_REQUEST_QUOTA_EXCEEDED\",\"message\":\"Tenant quota exceeded\"}")
                .addHeader("Content-Type", "application/json"));

        Payment payment = new Payment();
        payment.setUserId(1L);
        payment.setPropertyId(10L);
        payment.setAmount(BigDecimal.valueOf(50000));
        payment.setCurrency("XAF");

        StepVerifier.create(adapter.processPayment(payment))
                .expectErrorMatches(error -> error instanceof KernelCoreException
                        && "TENANT_REQUEST_QUOTA_EXCEEDED".equals(((KernelCoreException) error).getErrorCode()))
                .verify();
    }

    @Test
    public void testProcessPayment_ServiceNotSubscribedMapsToKernelCoreException() {
        mockWebServer.enqueue(new MockResponse()
                .setResponseCode(403)
                .setBody(
                        "{\"errorCode\":\"ORGANIZATION_SERVICE_NOT_SUBSCRIBED\",\"message\":\"Organization not subscribed to billing\"}")
                .addHeader("Content-Type", "application/json"));

        Payment payment = new Payment();
        payment.setUserId(1L);
        payment.setPropertyId(10L);
        payment.setAmount(BigDecimal.valueOf(50000));
        payment.setCurrency("XAF");

        StepVerifier.create(adapter.processPayment(payment))
                .expectErrorMatches(error -> error instanceof KernelCoreException
                        && "ORGANIZATION_SERVICE_NOT_SUBSCRIBED".equals(((KernelCoreException) error).getErrorCode()))
                .verify();
    }
}