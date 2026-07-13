package com.ksm.realestate.infrastructure.adapter.out.kernelcore;

import com.ksm.realestate.domain.exception.KernelCoreException;
import com.ksm.realestate.domain.model.KernelInvoiceCommand;
import com.ksm.realestate.infrastructure.config.KernelCoreProperties;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.test.StepVerifier;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Unit tests for KernelCorePaymentAdapter using MockWebServer.
 * Tests the updated flow: POST /api/accounting/invoices + /{id}/post
 *
 * @author ulrich675
 * @date 2026-07-10
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
        public void testCreateInvoice_Success() {
                // Step 1: invoice creation response
                mockWebServer.enqueue(new MockResponse()
                                .setResponseCode(200)
                                .setBody("{\"status\":\"SUCCESS\",\"data\":{\"id\":\"inv-123\",\"invoiceNumber\":\"INV-001\",\"status\":\"DRAFT\",\"currency\":\"XAF\",\"totalAmount\":250000}}")
                                .addHeader("Content-Type", "application/json"));
                // Step 2: post invoice response
                mockWebServer.enqueue(new MockResponse()
                                .setResponseCode(200)
                                .setBody("{\"status\":\"SUCCESS\"}")
                                .addHeader("Content-Type", "application/json"));

                KernelInvoiceCommand cmd = KernelInvoiceCommand.builder()
                                .customerThirdPartyId("customer-uuid-123")
                                .currency("XAF")
                                .productId("10")
                                .unitPrice(250000.0)
                                .quantity(1.0)
                                .build();

                StepVerifier.create(adapter.createInvoice(cmd))
                                .expectNextMatches(result -> "inv-123".equals(result.getInvoiceId())
                                                && "INV-001".equals(result.getInvoiceNumber())
                                                && "XAF".equals(result.getCurrency()))
                                .verifyComplete();
        }

        @Test
        public void testCreateInvoice_QuotaExceededMapsToKernelCoreException() {
                mockWebServer.enqueue(new MockResponse()
                                .setResponseCode(429)
                                .setBody("{\"errorCode\":\"TENANT_REQUEST_QUOTA_EXCEEDED\",\"message\":\"Quota exceeded\"}")
                                .addHeader("Content-Type", "application/json"));

                KernelInvoiceCommand cmd = KernelInvoiceCommand.builder()
                                .customerThirdPartyId("customer-uuid-456")
                                .currency("XAF")
                                .build();

                StepVerifier.create(adapter.createInvoice(cmd))
                                .expectErrorMatches(e -> e instanceof KernelCoreException
                                                && "TENANT_REQUEST_QUOTA_EXCEEDED"
                                                                .equals(((KernelCoreException) e).getErrorCode()))
                                .verify();
        }

        @Test
        public void testCreateInvoice_OrganizationHeaderIsSent() throws InterruptedException {
                mockWebServer.enqueue(new MockResponse()
                                .setResponseCode(200)
                                .setBody("{\"status\":\"SUCCESS\",\"data\":{\"id\":\"inv-456\",\"status\":\"DRAFT\",\"currency\":\"XAF\"}}")
                                .addHeader("Content-Type", "application/json"));
                mockWebServer.enqueue(new MockResponse()
                                .setResponseCode(200)
                                .setBody("{\"status\":\"SUCCESS\"}")
                                .addHeader("Content-Type", "application/json"));

                KernelInvoiceCommand cmd = KernelInvoiceCommand.builder()
                                .customerThirdPartyId("customer-uuid-789")
                                .currency("XAF")
                                .unitPrice(100000.0)
                                .quantity(1.0)
                                .build();

                StepVerifier.create(adapter.createInvoice(cmd))
                                .expectNextMatches(r -> "inv-456".equals(r.getInvoiceId()))
                                .verifyComplete();

                var recordedRequest = mockWebServer.takeRequest();
                assertEquals("22222222-2222-2222-2222-222222222222", recordedRequest.getHeader("X-Organization-Id"));
                assertEquals("11111111-1111-1111-1111-111111111111", recordedRequest.getHeader("X-Tenant-Id"));
        }

        @Test
        public void testCreateInvoice_ServiceNotSubscribed() {
                mockWebServer.enqueue(new MockResponse()
                                .setResponseCode(403)
                                .setBody("{\"errorCode\":\"ORGANIZATION_SERVICE_NOT_SUBSCRIBED\",\"message\":\"Not subscribed to billing\"}")
                                .addHeader("Content-Type", "application/json"));

                KernelInvoiceCommand cmd = KernelInvoiceCommand.builder()
                                .customerThirdPartyId("customer-uuid-999")
                                .currency("XAF")
                                .build();

                StepVerifier.create(adapter.createInvoice(cmd))
                                .expectErrorMatches(e -> e instanceof KernelCoreException
                                                && "ORGANIZATION_SERVICE_NOT_SUBSCRIBED"
                                                                .equals(((KernelCoreException) e).getErrorCode()))
                                .verify();
        }
}