package com.ksm.realestate.application.port.out;

import com.ksm.realestate.domain.model.User;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Outbound port for user persistence operations.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
public interface UserRepositoryPort {

    Mono<User> save(User user);

    Mono<User> findById(Long userId);

    Mono<User> findByEmail(String email);

    Flux<User> findAll();

    Mono<Void> deleteById(Long userId);
}
