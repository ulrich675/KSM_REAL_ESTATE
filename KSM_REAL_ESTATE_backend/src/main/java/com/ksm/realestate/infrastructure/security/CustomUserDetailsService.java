package com.ksm.realestate.infrastructure.security;

import com.ksm.realestate.application.port.out.UserRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import reactor.core.publisher.Mono;
import java.util.List;

import org.springframework.stereotype.Component;

/**
 * CustomUserDetailsService loads a UserDetails from the User domain model.
 *
 * @author Antigravity
 * @date 2026-07-08
 */
@Component
@RequiredArgsConstructor
public class CustomUserDetailsService implements ReactiveUserDetailsService {

    private final UserRepositoryPort userRepositoryPort;

    @Override
    public Mono<UserDetails> findByUsername(String username) {
        return userRepositoryPort.findByEmail(username)
                .switchIfEmpty(Mono.error(new UsernameNotFoundException("User not found: " + username)))
                .map(user -> org.springframework.security.core.userdetails.User.builder()
                        .username(user.getEmail())
                        .password(user.getPasswordHash())
                        .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                        .build());
    }
}
