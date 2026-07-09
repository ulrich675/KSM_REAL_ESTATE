package com.ksm.realestate.infrastructure.adapter.out.kernelcore;

import com.ksm.realestate.application.port.out.KernelCoreAuthPort;
import com.ksm.realestate.domain.exception.KernelCoreException;
import com.ksm.realestate.domain.model.KernelAuthResult;
import com.ksm.realestate.domain.model.KernelSignUpCommand;
import com.ksm.realestate.infrastructure.config.KernelCoreProperties;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * Adapter integrating KSM authentication with Yowyob auth-core.
 * It carries the required headers and processes multi-step/MFA transitions.
 *
 * @author Antigravity
 * @date 2026-07-09
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KernelCoreAuthAdapter implements KernelCoreAuthPort {

    private final WebClient kernelCoreWebClient;
    private final KernelCoreProperties properties;

    @Override
    public Mono<KernelAuthResult> signUp(KernelSignUpCommand command) {
        if (command.getTenantId() == null) {
            command.setTenantId(properties.getTenantId());
        }

        return kernelCoreWebClient.post()
                .uri("/api/auth/sign-up")
                .bodyValue(command)
                .retrieve()
                .onStatus(status -> status.isError(),
                        clientResponse -> clientResponse.bodyToMono(KernelErrorResponse.class)
                                .flatMap(err -> {
                                    String code = err.getErrorCode() != null ? err.getErrorCode() : "SIGNUP_FAILED";
                                    String msg = err.getMessage() != null ? err.getMessage()
                                            : "Failed to sign up on kernel-core";
                                    return Mono.<Throwable>error(new KernelCoreException(code, msg));
                                })
                                .switchIfEmpty(Mono.<Throwable>error(
                                        new KernelCoreException("SIGNUP_FAILED", "External signup failed"))))
                .bodyToMono(KernelApiResponse.class)
                .map(response -> {
                    KernelAuthData data = response.getData();
                    return mapToAuthResult(data);
                });
    }

    @Override
    public Mono<KernelAuthResult> login(String principal, String password) {
        Map<String, String> body = Map.of(
                "principal", principal,
                "password", password);

        return kernelCoreWebClient.post()
                .uri("/api/auth/login")
                .header("X-Tenant-Id", properties.getTenantId())
                .bodyValue(body)
                .retrieve()
                .onStatus(status -> status.isError(),
                        clientResponse -> clientResponse.bodyToMono(KernelErrorResponse.class)
                                .flatMap(err -> {
                                    String code = err.getErrorCode() != null ? err.getErrorCode() : "LOGIN_FAILED";
                                    String msg = err.getMessage() != null ? err.getMessage()
                                            : "Failed to login on kernel-core";
                                    return Mono.<Throwable>error(new KernelCoreException(code, msg));
                                })
                                .switchIfEmpty(Mono.<Throwable>error(
                                        new KernelCoreException("LOGIN_FAILED", "External login failed"))))
                .bodyToMono(KernelApiResponse.class)
                .map(response -> mapToAuthResult(response.getData()));
    }

    @Override
    public Mono<KernelAuthResult> confirmMfa(String mfaToken, String code) {
        Map<String, String> body = Map.of(
                "mfaToken", mfaToken,
                "code", code);

        return kernelCoreWebClient.post()
                .uri("/api/auth/login/mfa/confirm")
                .bodyValue(body)
                .retrieve()
                .onStatus(status -> status.isError(),
                        clientResponse -> clientResponse.bodyToMono(KernelErrorResponse.class)
                                .flatMap(err -> {
                                    String errCode = err.getErrorCode() != null ? err.getErrorCode() : "MFA_FAILED";
                                    String msg = err.getMessage() != null ? err.getMessage()
                                            : "MFA confirmation failed";
                                    return Mono.<Throwable>error(new KernelCoreException(errCode, msg));
                                })
                                .switchIfEmpty(Mono.<Throwable>error(
                                        new KernelCoreException("MFA_FAILED", "MFA verification failed"))))
                .bodyToMono(KernelApiResponse.class)
                .map(response -> mapToAuthResult(response.getData()));
    }

    private KernelAuthResult mapToAuthResult(KernelAuthData data) {
        if (data == null) {
            return new KernelAuthResult();
        }
        return KernelAuthResult.builder()
                .accessToken(data.getAccessToken())
                .refreshToken(data.getRefreshToken())
                .expiresInMs(data.getExpiresInMs())
                .tokenType(data.getTokenType())
                .nextStep(data.getNextStep())
                .mfaToken(data.getMfaToken())
                .build();
    }

    @Data
    public static class KernelApiResponse {
        private String status;
        private KernelAuthData data;
    }

    @Data
    public static class KernelAuthData {
        private String accessToken;
        private String refreshToken;
        private Long expiresInMs;
        private String tokenType;
        private String nextStep;
        private String mfaToken;
        private String id;
    }

    @Data
    public static class KernelErrorResponse {
        private String errorCode;
        private String message;
    }
}
