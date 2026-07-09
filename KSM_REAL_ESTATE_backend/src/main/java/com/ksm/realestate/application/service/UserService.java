package com.ksm.realestate.application.service;

import com.ksm.realestate.application.port.in.RegisterUserUseCase;
import com.ksm.realestate.application.port.in.GetUserByEmailUseCase;
import com.ksm.realestate.application.port.out.KernelCoreAuthPort;
import com.ksm.realestate.application.port.out.UserRepositoryPort;
import com.ksm.realestate.domain.exception.UserNotFoundException;
import com.ksm.realestate.domain.model.KernelSignUpCommand;
import com.ksm.realestate.domain.model.Role;
import com.ksm.realestate.domain.model.User;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;
import java.time.Instant;

/**
 * Service managing user operations, delegating registration to kernel-core auth
 * and caching profile records locally.
 *
 * @author Antigravity
 * @date 2026-07-09
 */
@Service
@RequiredArgsConstructor
public class UserService implements RegisterUserUseCase, GetUserByEmailUseCase {

    private final UserRepositoryPort userRepositoryPort;
    private final KernelCoreAuthPort kernelCoreAuthPort;

    @Override
    public Mono<User> register(User user) {
        KernelSignUpCommand signUpCmd = KernelSignUpCommand.builder()
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getUsername())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .password(user.getPasswordHash()) // Raw password passed via passwordHash field by mapper
                .businessType(user.getBusinessType())
                .build();

        return kernelCoreAuthPort.signUp(signUpCmd)
                .flatMap(authResult -> userRepositoryPort.findByEmail(user.getEmail())
                        .flatMap(existing -> {
                            existing.setFirstName(user.getFirstName());
                            existing.setLastName(user.getLastName());
                            existing.setPhoneNumber(user.getPhoneNumber());
                            existing.setUsername(user.getUsername());
                            existing.setBusinessType(user.getBusinessType());
                            existing.setUpdatedAt(Instant.now());
                            return userRepositoryPort.save(existing);
                        })
                        .switchIfEmpty(Mono.defer(() -> {
                            User local = new User();
                            local.setEmail(user.getEmail());
                            local.setFirstName(user.getFirstName());
                            local.setLastName(user.getLastName());
                            local.setUsername(user.getUsername());
                            local.setPhoneNumber(user.getPhoneNumber());
                            local.setBusinessType(user.getBusinessType());
                            local.setRole(Role.CLIENT);
                            local.setPasswordHash(""); // Externalized auth
                            Instant now = Instant.now();
                            local.setCreatedAt(now);
                            local.setUpdatedAt(now);
                            return userRepositoryPort.save(local);
                        })));
    }

    public Mono<User> registerUser(User user) {
        return register(user);
    }

    public Mono<User> getUserById(Long userId) {
        return userRepositoryPort.findById(userId)
                .switchIfEmpty(Mono.error(new UserNotFoundException("User not found: " + userId)));
    }

    public Mono<User> getUserByEmail(String email) {
        return userRepositoryPort.findByEmail(email)
                .switchIfEmpty(Mono.error(new UserNotFoundException("User not found with email: " + email)));
    }

    public Mono<User> requestProprietorRole(Long userId) {
        return getUserById(userId)
                .flatMap(user -> {
                    user.setRole(Role.PROPRIETOR_PENDING);
                    user.setUpdatedAt(Instant.now());
                    return userRepositoryPort.save(user);
                });
    }

    public Mono<User> handleProprietorRequest(Long userId, boolean approved) {
        return getUserById(userId)
                .flatMap(user -> {
                    user.setRole(approved ? Role.PROPRIETOR : Role.CLIENT);
                    user.setUpdatedAt(Instant.now());
                    return userRepositoryPort.save(user);
                });
    }
}