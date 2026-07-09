package com.ksm.realestate.infrastructure.adapter.in;

import com.ksm.realestate.application.dto.request.AuthLoginRequest;
import com.ksm.realestate.application.dto.request.UserCreateRequest;
import com.ksm.realestate.application.dto.response.AuthResponse;
import com.ksm.realestate.application.dto.response.UserResponse;
import com.ksm.realestate.application.port.in.AuthenticateUserUseCase;
import com.ksm.realestate.application.port.in.GetUserByEmailUseCase;
import com.ksm.realestate.application.port.in.RegisterUserUseCase;
import com.ksm.realestate.infrastructure.mapper.UserMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.time.Instant;

/**
 * REST controller for authentication endpoints (register and login).
 *
 * @author Antigravity
 * @date 2026-07-08
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final RegisterUserUseCase registerUserUseCase;
    private final AuthenticateUserUseCase authenticateUserUseCase;
    private final GetUserByEmailUseCase getUserByEmailUseCase;
    private final UserMapper userMapper;

    /**
     * Register a new user account.
     *
     * @param request the registration details
     * @return API response with the created user
     */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse<UserResponse>> register(@Valid @RequestBody UserCreateRequest request) {
        var domain = userMapper.toDomain(request);
        return registerUserUseCase.register(domain)
                .map(userMapper::toResponse)
                .map(userResp -> ApiResponse.<UserResponse>builder()
                        .status("SUCCESS")
                        .message("User registered successfully")
                        .data(userResp)
                        .timestamp(Instant.now())
                        .errors(null)
                        .build());
    }

    /**
     * Authenticate a user and return a JWT token or MFA steps.
     *
     * @param request the login credentials
     * @return API response with the JWT token or MFA status
     */
    @PostMapping("/login")
    public Mono<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthLoginRequest request) {
        return authenticateUserUseCase.authenticate(request.getEmail(), request.getPassword())
                .flatMap(result -> {
                    if ("CONFIRM_MFA".equals(result.getNextStep())) {
                        return Mono.just(AuthResponse.builder()
                                .nextStep(result.getNextStep())
                                .mfaToken(result.getMfaToken())
                                .build());
                    }
                    return getUserByEmailUseCase.getUserByEmail(request.getEmail())
                            .map(userMapper::toResponse)
                            .map(userResp -> AuthResponse.builder()
                                    .token(result.getAccessToken())
                                    .tokenType(result.getTokenType() != null ? result.getTokenType() : "Bearer")
                                    .expiresInMs(result.getExpiresInMs() != null ? result.getExpiresInMs() : 86400000L)
                                    .user(userResp)
                                    .build());
                })
                .map(authResp -> ApiResponse.<AuthResponse>builder()
                        .status("SUCCESS")
                        .message("Login request processed")
                        .data(authResp)
                        .timestamp(Instant.now())
                        .errors(null)
                        .build());
    }

    /**
     * Confirm MFA login using verification code.
     *
     * @param body map containing mfaToken and code
     * @return API response with the verified JWT token
     */
    @PostMapping("/login/mfa/confirm")
    public Mono<ApiResponse<AuthResponse>> confirmMfa(@RequestBody java.util.Map<String, String> body) {
        String mfaToken = body.get("mfaToken");
        String code = body.get("code");
        return authenticateUserUseCase.confirmMfa(mfaToken, code)
                .map(result -> AuthResponse.builder()
                        .token(result.getAccessToken())
                        .tokenType(result.getTokenType() != null ? result.getTokenType() : "Bearer")
                        .expiresInMs(result.getExpiresInMs() != null ? result.getExpiresInMs() : 86400000L)
                        .build())
                .map(authResp -> ApiResponse.<AuthResponse>builder()
                        .status("SUCCESS")
                        .message("MFA confirmed successfully")
                        .data(authResp)
                        .timestamp(Instant.now())
                        .errors(null)
                        .build());
    }
}
