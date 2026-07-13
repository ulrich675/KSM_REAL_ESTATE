package com.ksm.realestate.application.service;

import com.ksm.realestate.application.port.in.AuthenticateUserUseCase;
import com.ksm.realestate.application.port.out.KernelCoreAuthPort;
import com.ksm.realestate.application.port.out.UserRepositoryPort;
import com.ksm.realestate.domain.model.KernelAuthResult;
import com.ksm.realestate.domain.model.Role;
import com.ksm.realestate.domain.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Instant;

/**
 * AuthenticationService handles login delegation and MFA confirmation via
 * KernelCoreAuthPort.
 *
 * @author ulrich675
 * @date 2026-07-09
 */
@Service
@RequiredArgsConstructor
public class AuthenticationService implements AuthenticateUserUseCase {

    private final UserRepositoryPort userRepositoryPort;
    private final KernelCoreAuthPort kernelCoreAuthPort;

    @Override
    public Mono<KernelAuthResult> authenticate(String email, String password) {
        return kernelCoreAuthPort.login(email, password)
                .flatMap(authResult -> {
                    if ("CONFIRM_MFA".equals(authResult.getNextStep())) {
                        return Mono.just(authResult);
                    }
                    // For simple login, sync local user cache
                    return syncLocalUser(email)
                            .thenReturn(authResult);
                });
    }

    @Override
    public Mono<KernelAuthResult> confirmMfa(String mfaToken, String code) {
        return kernelCoreAuthPort.confirmMfa(mfaToken, code);
    }

    private Mono<User> syncLocalUser(String email) {
        return userRepositoryPort.findByEmail(email)
                .switchIfEmpty(Mono.defer(() -> {
                    // Logged in successfully via kernel-core but not yet in local cache: create it
                    User user = new User();
                    user.setEmail(email);
                    user.setFirstName("External");
                    user.setLastName("User");
                    user.setUsername(email.split("@")[0]);
                    user.setRole(Role.CLIENT);
                    user.setPasswordHash("");
                    Instant now = Instant.now();
                    user.setCreatedAt(now);
                    user.setUpdatedAt(now);
                    return userRepositoryPort.save(user);
                }));
    }
}
