package com.ksm.realestate.application.port.out;

import com.ksm.realestate.domain.model.KernelAuthResult;
import com.ksm.realestate.domain.model.KernelSignUpCommand;
import reactor.core.publisher.Mono;

/**
 * Outbound port for performing authentication and identity management
 * operations
 * against the external kernel-core service.
 *
 * @author Antigravity
 * @date 2026-07-09
 */
public interface KernelCoreAuthPort {

    /**
     * Registers a new user on the kernel-core auth manager.
     *
     * @param command the sign up parameters details
     * @return the result holding tokens or mfa requirements
     */
    Mono<KernelAuthResult> signUp(KernelSignUpCommand command);

    /**
     * Authenticates a user using principal (email/username) and password.
     *
     * @param principal the user identifier (email, username)
     * @param password  the plain text password
     * @return the authentication result
     */
    Mono<KernelAuthResult> login(String principal, String password);

    /**
     * Confirms the Multi-Factor Authentication step for login when required.
     *
     * @param mfaToken the MFA transaction token returned from initial login
     * @param code     the one-time verification code
     * @return the authentication result containing tokens on success
     */
    Mono<KernelAuthResult> confirmMfa(String mfaToken, String code);
}
