package com.ksm.realestate.infrastructure.adapter.out.kernelcore;

import com.ksm.realestate.domain.exception.KernelCoreException;
import com.ksm.realestate.domain.model.KernelSignUpCommand;
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
 * Unit tests for KernelCoreAuthAdapter using MockWebServer to simulate
 * kernel-core auth-core HTTP responses without a real network call.
 *
 * @author Antigravity
 * @date 2026-07-09
 */
public class KernelCoreAuthAdapterTest {

    private MockWebServer mockWebServer;
    private KernelCoreAuthAdapter adapter;

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

        adapter = new KernelCoreAuthAdapter(webClient, properties);
    }

    @AfterEach
    public void tearDown() throws IOException {
        mockWebServer.shutdown();
    }

    @Test
    public void testSignUp_Success() {
        mockWebServer.enqueue(new MockResponse()
                .setResponseCode(200)
                .setBody("{\"status\":\"SUCCESS\",\"data\":{\"accessToken\":\"tok-123\",\"tokenType\":\"Bearer\",\"expiresInMs\":86400000}}")
                .addHeader("Content-Type", "application/json"));

        KernelSignUpCommand command = KernelSignUpCommand.builder()
                .firstName("John")
                .lastName("Doe")
                .username("jdoe")
                .email("jdoe@ksm.com")
                .phoneNumber("+237600000000")
                .password("Passw0rd!!")
                .businessType("AGENCY")
                .build();

        StepVerifier.create(adapter.signUp(command))
                .expectNextMatches(result -> "tok-123".equals(result.getAccessToken()) && "Bearer".equals(result.getTokenType()))
                .verifyComplete();
    }

    @Test
    public void testSignUp_KernelErrorMapsToKernelCoreException() {
        mockWebServer.enqueue(new MockResponse()
                .setResponseCode(500)
                .setBody("{\"errorCode\":\"CLIENT_APPLICATION_SERVICE_NOT_ALLOWED\",\"message\":\"Service not allowed for this client\"}")
                .addHeader("Content-Type", "application/json"));

        KernelSignUpCommand command = KernelSignUpCommand.builder()
                .firstName("John")
                .lastName("Doe")
                .username("jdoe")
                .email("jdoe@ksm.com")
                .phoneNumber("+237600000000")
                .password("Passw0rd!!")
                .businessType("AGENCY")
                .build();

        StepVerifier.create(adapter.signUp(command))
                .expectErrorMatches(error -> error instanceof KernelCoreException && "CLIENT_APPLICATION_SERVICE_NOT_ALLOWED".equals(((KernelCoreException) error).getErrorCode()))
                .verify();
    }

    @Test
    public void testLogin_MfaRequiredReturnsNextStep() {
        mockWebServer.enqueue(new MockResponse()
                .setResponseCode(202)
                .setBody("{\"status\":\"SUCCESS\",\"data\":{\"nextStep\":\"CONFIRM_MFA\",\"mfaToken\":\"mfa-tok-1\"}}")
                .addHeader("Content-Type", "application/json"));

        StepVerifier.create(adapter.login("jdoe@ksm.com", "Passw0rd!!"))
                .expectNextMatches(result -> "CONFIRM_MFA".equals(result.getNextStep()) && "mfa-tok-1".equals(result.getMfaToken()))
                .verifyComplete();
    }

    @Test
    public void testLogin_TenantHeaderIsSent() throws InterruptedException {
        mockWebServer.enqueue(new MockResponse()
                .setResponseCode(200)
                .setBody("{\"status\":\"SUCCESS\",\"data\":{\"accessToken\":\"tok-999\"}}")
                .addHeader("Content-Type", "application/json"));

        StepVerifier.create(adapter.login("jdoe@ksm.com", "Passw0rd!!"))
                .expectNextMatches(result -> "tok-999".equals(result.getAccessToken()))
                .verifyComplete();

        var recordedRequest = mockWebServer.takeRequest();
        assertEquals("11111111-1111-1111-1111-111111111111", recordedRequest.getHeader("X-Tenant-Id"));
        assertEquals("test-client", recordedRequest.getHeader("X-Client-Id"));
        assertEquals("test-api-key", recordedRequest.getHeader("X-Api-Key"));
    }

    @Test
    public void testConfirmMfa_Success() {
        mockWebServer.enqueue(new MockResponse()
                .setResponseCode(200)
                .setBody("{\"status\":\"SUCCESS\",\"data\":{\"accessToken\":\"tok-after-mfa\"}}")
                .addHeader("Content-Type", "application/json"));

        StepVerifier.create(adapter.confirmMfa("mfa-tok-1", "123456"))
                .expectNextMatches(result -> "tok-after-mfa".equals(result.getAccessToken()))
                .verifyComplete();
    }
}
