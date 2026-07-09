package com.ksm.realestate.application.port.in;

import com.ksm.realestate.domain.model.User;
import reactor.core.publisher.Mono;

/**
 * Use‑case for user registration.
 *
 * @author Antigravity
 * @date 2026-07-08
 */
public interface RegisterUserUseCase {
    /**
     * Register a new user.
     *
     * @param user the user details
     * @return the registered user
     */
    Mono<User> register(User user);
}
