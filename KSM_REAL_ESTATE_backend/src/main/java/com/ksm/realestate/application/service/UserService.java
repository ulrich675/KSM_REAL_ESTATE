package com.ksm.realestate.application.service;

import com.ksm.realestate.application.port.in.RegisterUserUseCase;
import com.ksm.realestate.application.port.in.GetUserByEmailUseCase;
import com.ksm.realestate.application.port.out.KernelCoreAuthPort;
import com.ksm.realestate.application.port.out.UserRepositoryPort;
import com.ksm.realestate.domain.exception.UserNotFoundException;
import com.ksm.realestate.application.port.out.ProprietorRequestRepositoryPort;
import com.ksm.realestate.domain.model.KernelSignUpCommand;
import com.ksm.realestate.domain.model.ProprietorRequest;
import com.ksm.realestate.domain.model.ProprietorRequestStatus;
import com.ksm.realestate.domain.model.Role;
import com.ksm.realestate.domain.model.User;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.time.Instant;

/**
 * Service managing user operations, delegating registration to kernel-core auth
 * and caching profile records locally.
 *
 * @author ulrich675
 * @date 2026-07-09
 */
@Service
@RequiredArgsConstructor
public class UserService implements RegisterUserUseCase, GetUserByEmailUseCase {

    private final UserRepositoryPort userRepositoryPort;
    private final KernelCoreAuthPort kernelCoreAuthPort;
    private final ProprietorRequestRepositoryPort proprietorRequestRepositoryPort;

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

    public Mono<User> submitProprietorRequest(Long userId, String phoneNumber, String address, String motivation) {
        return getUserById(userId)
                .flatMap(user -> {
                    ProprietorRequest req = ProprietorRequest.builder()
                            .userId(userId)
                            .phoneNumber(phoneNumber)
                            .physicalAddress(address)
                            .motivation(motivation)
                            .status(ProprietorRequestStatus.PENDING)
                            .createdAt(Instant.now())
                            .updatedAt(Instant.now())
                            .build();

                    return proprietorRequestRepositoryPort.save(req)
                            .flatMap(savedReq -> {
                                user.setRole(Role.PROPRIETOR_PENDING);
                                user.setUpdatedAt(Instant.now());
                                return userRepositoryPort.save(user);
                            });
                });
    }

    public Mono<User> handleProprietorRequest(Long requestId, boolean approved) {
        return proprietorRequestRepositoryPort.findById(requestId)
                .flatMap(request -> {
                    request.setStatus(approved ? ProprietorRequestStatus.APPROVED : ProprietorRequestStatus.REJECTED);
                    request.setUpdatedAt(Instant.now());
                    return proprietorRequestRepositoryPort.save(request);
                })
                .flatMap(updatedRequest -> getUserById(updatedRequest.getUserId()))
                .flatMap(user -> {
                    user.setRole(approved ? Role.PROPRIETOR : Role.CLIENT);
                    user.setUpdatedAt(Instant.now());
                    return userRepositoryPort.save(user);
                });
    }

    public Flux<ProprietorRequest> getAllProprietorRequests() {
        return proprietorRequestRepositoryPort.findAll();
    }

    /**
     * Returns all users with the given role.
     *
     * @author ulrich675
     */
    public Flux<User> getUsersByRole(Role role) {
        return userRepositoryPort.findByRole(role);
    }

    /**
     * Returns all users.
     *
     * @author ulrich675
     */
    public Flux<User> getAllUsers() {
        return userRepositoryPort.findAll();
    }

    /**
     * Toggles the active status of a user account.
     *
     * @author ulrich675
     */
    public Mono<User> toggleUserActive(Long userId) {
        return getUserById(userId)
                .flatMap(user -> {
                    user.setActive(user.getActive() == null || !user.getActive());
                    user.setUpdatedAt(Instant.now());
                    return userRepositoryPort.save(user);
                });
    }
}