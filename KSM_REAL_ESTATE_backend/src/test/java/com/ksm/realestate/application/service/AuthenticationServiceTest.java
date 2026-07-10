package com.ksm.realestate.application.service;

import com.ksm.realestate.application.port.out.KernelCoreAuthPort;
import com.ksm.realestate.application.port.out.UserRepositoryPort;
import com.ksm.realestate.domain.model.KernelAuthResult;
import com.ksm.realestate.domain.model.Role;
import com.ksm.realestate.domain.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;

/**
 * Unit tests for AuthenticationService, covering login delegation, local user
 * cache sync, and MFA confirmation flows against KernelCoreAuthPort.
 *
 * @author Antigravity
 * @date 2026-07-09
 */
@ExtendWith(MockitoExtension.class)
public class AuthenticationServiceTest {

        @Mock
        private UserRepositoryPort userRepositoryPort;

        @Mock
        private KernelCoreAuthPort kernelCoreAuthPort;

        private AuthenticationService authenticationService;

        @BeforeEach
        public void setUp() {
                authenticationService = new AuthenticationService(userRepositoryPort, kernelCoreAuthPort);
        }

        @Test
        public void testAuthenticate_SuccessSyncsExistingLocalUser() {
                KernelAuthResult kernelResult = KernelAuthResult.builder()
                                .accessToken("access-token-123")
                                .tokenType("Bearer")
                                .expiresInSeconds(86400L)
                                .build();

                User existing = new User();
                existing.setUserId(1L);
                existing.setEmail("test@ksm.com");
                existing.setRole(Role.CLIENT);

                Mockito.when(kernelCoreAuthPort.login("test@ksm.com", "Passw0rd!")).thenReturn(Mono.just(kernelResult));
                Mockito.when(userRepositoryPort.findByEmail("test@ksm.com")).thenReturn(Mono.just(existing));

                StepVerifier.create(authenticationService.authenticate("test@ksm.com", "Passw0rd!"))
                                .expectNextMatches(result -> "access-token-123".equals(result.getAccessToken()))
                                .verifyComplete();

                Mockito.verify(userRepositoryPort, Mockito.never()).save(any(User.class));
        }

        @Test
        public void testAuthenticate_SuccessCreatesLocalUserWhenAbsent() {
                KernelAuthResult kernelResult = KernelAuthResult.builder()
                                .accessToken("access-token-456")
                                .tokenType("Bearer")
                                .expiresInSeconds(86400L)
                                .build();

                Mockito.when(kernelCoreAuthPort.login("new@ksm.com", "Passw0rd!")).thenReturn(Mono.just(kernelResult));
                Mockito.when(userRepositoryPort.findByEmail("new@ksm.com")).thenReturn(Mono.empty());
                Mockito.when(userRepositoryPort.save(any(User.class)))
                                .thenAnswer(invocation -> Mono.just((User) invocation.getArgument(0)));

                StepVerifier.create(authenticationService.authenticate("new@ksm.com", "Passw0rd!"))
                                .expectNextMatches(result -> "access-token-456".equals(result.getAccessToken()))
                                .verifyComplete();

                Mockito.verify(userRepositoryPort).save(any(User.class));
        }

        @Test
        public void testAuthenticate_MfaRequiredDoesNotSyncLocalUser() {
                KernelAuthResult mfaResult = KernelAuthResult.builder()
                                .nextStep("CONFIRM_MFA")
                                .mfaToken("mfa-token-789")
                                .build();

                Mockito.when(kernelCoreAuthPort.login("mfa@ksm.com", "Passw0rd!")).thenReturn(Mono.just(mfaResult));

                StepVerifier.create(authenticationService.authenticate("mfa@ksm.com", "Passw0rd!"))
                                .expectNextMatches(result -> "CONFIRM_MFA".equals(result.getNextStep())
                                                && "mfa-token-789".equals(result.getMfaToken()))
                                .verifyComplete();

                Mockito.verify(userRepositoryPort, Mockito.never()).findByEmail(anyString());
                Mockito.verify(userRepositoryPort, Mockito.never()).save(any(User.class));
        }

        @Test
        public void testConfirmMfa_DelegatesToKernelCore() {
                KernelAuthResult kernelResult = KernelAuthResult.builder()
                                .accessToken("access-token-after-mfa")
                                .tokenType("Bearer")
                                .expiresInSeconds(86400L)
                                .build();

                Mockito.when(kernelCoreAuthPort.confirmMfa("mfa-token-789", "123456"))
                                .thenReturn(Mono.just(kernelResult));

                StepVerifier.create(authenticationService.confirmMfa("mfa-token-789", "123456"))
                                .expectNextMatches(result -> "access-token-after-mfa".equals(result.getAccessToken()))
                                .verifyComplete();
        }
}
