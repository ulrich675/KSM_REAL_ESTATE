package com.ksm.realestate.application.port.in;

import com.ksm.realestate.domain.model.User;
import reactor.core.publisher.Mono;

/**
 * Use-case for retrieving a user profile by email.
 *
 * @author ulrich675
 * @date 2026-07-09
 */
public interface GetUserByEmailUseCase {

    /**
     * Retrieve a user by their email address.
     *
     * @param email the user email
     * @return the matching user
     * @throws com.ksm.realestate.domain.exception.UserNotFoundException if no user
     *                                                                   matches
     */
    Mono<User> getUserByEmail(String email);
}
