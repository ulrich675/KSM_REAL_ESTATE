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

import java.util.List;
import java.util.Map;

/**
 * Adapter integrating KSM authentication with Yowyob auth-core.
 * Endpoints used (from kernel-core.yowyob.com OpenAPI):
 * <ul>
 * <li>POST /api/auth/sign-up — PublicSignUpRequest</li>
 * <li>POST /api/auth/login — LoginRequest (principal + password)</li>
 * <li>POST /api/auth/login/mfa/confirm — ConfirmMfaLoginRequest</li>
 * <li>POST /api/auth/refresh — RefreshTokenRequest</li>
 * </ul>
 *
 * @author Antigravity
 * @date 2026-07-10
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KernelCoreAuthAdapter implements KernelCoreAuthPort {

        private final WebClient kernelCoreWebClient;
        private final KernelCoreProperties properties;

        // ─── sign-up ─────────────────────────────────────────────────────────────

        @Override
        public Mono<KernelAuthResult> signUp(KernelSignUpCommand command) {
                // PublicSignUpRequest: firstName, lastName, email required; tenantId injected
                Map<String, Object> body = new java.util.LinkedHashMap<>();
                body.put("tenantId", properties.getTenantId());
                body.put("firstName", command.getFirstName());
                body.put("lastName", command.getLastName());
                body.put("username", command.getUsername());
                body.put("email", command.getEmail());
                body.put("phoneNumber", command.getPhoneNumber());
                body.put("password", command.getPassword());
                if (command.getBusinessType() != null) {
                        body.put("businessType", command.getBusinessType());
                }

                return kernelCoreWebClient.post()
                                .uri("/api/auth/sign-up")
                                .bodyValue(body)
                                .retrieve()
                                .onStatus(s -> s.isError(), r -> r.bodyToMono(KernelErrorResponse.class)
                                                .flatMap(err -> Mono.<Throwable>error(new KernelCoreException(
                                                                err.getErrorCode() != null ? err.getErrorCode()
                                                                                : "SIGNUP_FAILED",
                                                                err.getMessage() != null ? err.getMessage()
                                                                                : "Sign-up failed")))
                                                .switchIfEmpty(Mono.<Throwable>error(new KernelCoreException(
                                                                "SIGNUP_FAILED", "Sign-up failed"))))
                                .bodyToMono(KernelApiResponse.class)
                                .map(r -> mapLoginResponse(r.getData()));
        }

        // ─── login ───────────────────────────────────────────────────────────────

        @Override
        public Mono<KernelAuthResult> login(String principal, String password) {
                Map<String, String> body = Map.of("principal", principal, "password", password);

                return kernelCoreWebClient.post()
                                .uri("/api/auth/login")
                                .header("X-Tenant-Id", properties.getTenantId())
                                .bodyValue(body)
                                .retrieve()
                                .onStatus(s -> s.isError(), r -> r.bodyToMono(KernelErrorResponse.class)
                                                .flatMap(err -> Mono.<Throwable>error(new KernelCoreException(
                                                                err.getErrorCode() != null ? err.getErrorCode()
                                                                                : "LOGIN_FAILED",
                                                                err.getMessage() != null ? err.getMessage()
                                                                                : "Login failed")))
                                                .switchIfEmpty(Mono.<Throwable>error(new KernelCoreException(
                                                                "LOGIN_FAILED", "Login failed"))))
                                .bodyToMono(KernelApiResponse.class)
                                .map(r -> mapLoginResponse(r.getData()));
        }

        // ─── MFA confirm ─────────────────────────────────────────────────────────

        @Override
        public Mono<KernelAuthResult> confirmMfa(String mfaToken, String code) {
                Map<String, String> body = Map.of("mfaToken", mfaToken, "code", code);

                return kernelCoreWebClient.post()
                                .uri("/api/auth/login/mfa/confirm")
                                .bodyValue(body)
                                .retrieve()
                                .onStatus(s -> s.isError(), r -> r.bodyToMono(KernelErrorResponse.class)
                                                .flatMap(err -> Mono.<Throwable>error(new KernelCoreException(
                                                                err.getErrorCode() != null ? err.getErrorCode()
                                                                                : "MFA_FAILED",
                                                                err.getMessage() != null ? err.getMessage()
                                                                                : "MFA confirmation failed")))
                                                .switchIfEmpty(Mono.<Throwable>error(new KernelCoreException(
                                                                "MFA_FAILED", "MFA confirmation failed"))))
                                .bodyToMono(KernelApiResponse.class)
                                .map(r -> mapLoginResponse(r.getData()));
        }

        // ─── refresh token ───────────────────────────────────────────────────────

        @Override
        public Mono<KernelAuthResult> refreshToken(String refreshToken) {
                Map<String, String> body = Map.of("refreshToken", refreshToken);

                return kernelCoreWebClient.post()
                                .uri("/api/auth/refresh")
                                .bodyValue(body)
                                .retrieve()
                                .onStatus(s -> s.isError(), r -> r.bodyToMono(KernelErrorResponse.class)
                                                .flatMap(err -> Mono.<Throwable>error(new KernelCoreException(
                                                                err.getErrorCode() != null ? err.getErrorCode()
                                                                                : "REFRESH_FAILED",
                                                                err.getMessage() != null ? err.getMessage()
                                                                                : "Token refresh failed")))
                                                .switchIfEmpty(Mono.<Throwable>error(new KernelCoreException(
                                                                "REFRESH_FAILED", "Token refresh failed"))))
                                .bodyToMono(KernelApiResponse.class)
                                .map(r -> mapLoginResponse(r.getData()));
        }

        // ─── mapping ─────────────────────────────────────────────────────────────

        private KernelAuthResult mapLoginResponse(LoginResponseData data) {
                if (data == null)
                        return new KernelAuthResult();
                return KernelAuthResult.builder()
                                .id(data.getId())
                                .actorId(data.getActorId())
                                .accessToken(data.getAccessToken())
                                .sessionToken(data.getSessionToken())
                                .refreshToken(data.getRefreshToken())
                                // kernel returns expiresInSeconds; convert for callers who need ms
                                .expiresInSeconds(data.getExpiresInSeconds())
                                .tokenType(data.getTokenType())
                                .nextStep(data.getNextStep())
                                .mfaToken(data.getMfaToken())
                                .mfaEnabled(data.getMfaEnabled())
                                .email(data.getEmail())
                                .username(data.getUsername())
                                .authorities(data.getAuthorities())
                                .build();
        }

        // ─── inner DTOs ──────────────────────────────────────────────────────────

        @Data
        public static class KernelApiResponse {
                private String status;
                private LoginResponseData data;
        }

        /**
         * Maps {@code LoginResponse} from kernel-core OpenAPI.
         * key fields from spec: id, actorId, accessToken, sessionToken, tokenType,
         * expiresInSeconds, nextStep, mfaToken, mfaEnabled, email, username,
         * authorities
         */
        @Data
        public static class LoginResponseData {
                private String id;
                private String tenantId;
                private String actorId;
                private String username;
                private String email;
                private String phoneNumber;
                private String accessToken;
                private String sessionToken;
                private String refreshToken;
                private String tokenType;
                private Long expiresInSeconds;
                // MFA fields
                private String nextStep;
                private String mfaToken;
                private Boolean mfaEnabled;
                private String mfaChannel;
                // Authorities
                private List<String> authorities;
        }

        @Data
        public static class KernelErrorResponse {
                private String errorCode;
                private String message;
        }
}
