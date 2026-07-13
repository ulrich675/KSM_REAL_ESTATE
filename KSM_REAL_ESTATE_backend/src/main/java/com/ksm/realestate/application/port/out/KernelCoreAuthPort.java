package com.ksm.realestate.application.port.out;

import com.ksm.realestate.domain.model.KernelAuthResult;
import com.ksm.realestate.domain.model.KernelSignUpCommand;
import reactor.core.publisher.Mono;

/**
 * Outbound port for authentication and identity management via kernel-core
 * auth-core.
 * Endpoints: /api/auth/sign-up, /api/auth/login, /api/auth/login/mfa/confirm,
 * /api/auth/refresh
 *
 * @author ulrich675
 * @date 2026-07-10
 */
public interface KernelCoreAuthPort {

    /**
     * Registers a new user via POST /api/auth/sign-up (PublicSignUpRequest).
     *
     * @param command sign-up parameters (firstName, lastName, email required)
     * @return the authentication result (tokens or MFA transition)
     */
    Mono<KernelAuthResult> signUp(KernelSignUpCommand command);

    /**
     * Authenticates a user via POST /api/auth/login (LoginRequest: principal +
     * password).
     *
     * @param principal the user identifier (email or username)
     * @param password  the plain-text password
     * @return authentication result with tokens or nextStep="CONFIRM_MFA"
     */
    Mono<KernelAuthResult> login(String principal, String password);

    /**
     * Confirms the MFA step via POST /api/auth/login/mfa/confirm (mfaToken + code).
     *
     * @param mfaToken the MFA transaction token from the initial login
     * @param code     the one-time verification code
     * @return authentication result containing final access tokens
     */
    Mono<KernelAuthResult> confirmMfa(String mfaToken, String code);

    /**
     * Refreshes an expired access token via POST /api/auth/refresh (refreshToken).
     *
     * @param refreshToken the refresh token from a previous login
     * @return new authentication result with refreshed tokens
     */
    Mono<KernelAuthResult> refreshToken(String refreshToken);
}
