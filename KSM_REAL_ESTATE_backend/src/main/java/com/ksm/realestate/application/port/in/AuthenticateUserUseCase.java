package com.ksm.realestate.application.port.in;

import com.ksm.realestate.domain.model.KernelAuthResult;
import reactor.core.publisher.Mono;

/**
 * Use‑case for authenticating a user.
 * Supports multi-step/MFA login.
 *
 * @author ulrich675
 * @date 2026-07-09
 */
public interface AuthenticateUserUseCase {
    /**
     * Authenticate a user and return the auth result.
     *
     * @param email    user email
     * @param password user raw password
     * @return the authentication result
     */
    Mono<KernelAuthResult> authenticate(String email, String password);

    /**
     * Confirm MFA for login.
     *
     * @param mfaToken the MFA token
     * @param code     the verification code
     * @return the authentication result containing tokens
     */
    Mono<KernelAuthResult> confirmMfa(String mfaToken, String code);
}
