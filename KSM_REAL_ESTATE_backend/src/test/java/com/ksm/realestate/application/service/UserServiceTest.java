package com.ksm.realestate.application.service;

import com.ksm.realestate.application.port.out.KernelCoreAuthPort;
import com.ksm.realestate.application.port.out.UserRepositoryPort;
import com.ksm.realestate.application.port.out.ProprietorRequestRepositoryPort;
import com.ksm.realestate.domain.exception.UserNotFoundException;
import com.ksm.realestate.domain.model.KernelAuthResult;
import com.ksm.realestate.domain.model.Role;
import com.ksm.realestate.domain.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepositoryPort userRepositoryPort;

    @Mock
    private KernelCoreAuthPort kernelCoreAuthPort;

    @Mock
    private ProprietorRequestRepositoryPort proprietorRequestRepositoryPort;

    private UserService userService;
    private User testUser;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        userService = new UserService(userRepositoryPort, kernelCoreAuthPort, proprietorRequestRepositoryPort);
        testUser = new User();
        testUser.setUserId(1L);
        testUser.setEmail("test@ksm.com");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setRole(Role.CLIENT);
        testUser.setPasswordHash("rawPasswordPlaceholder");
    }

    @Test
    public void testRegisterUser_DelegatesKernelAndCachesLocally() {
        KernelAuthResult kernelResult = KernelAuthResult.builder()
                .accessToken("some-token")
                .build();

        Mockito.when(kernelCoreAuthPort.signUp(any())).thenReturn(Mono.just(kernelResult));
        Mockito.when(userRepositoryPort.findByEmail("test@ksm.com")).thenReturn(Mono.empty());
        Mockito.when(userRepositoryPort.save(any(User.class)))
                .thenAnswer(invocation -> Mono.just((User) invocation.getArgument(0)));

        Mono<User> result = userService.register(testUser);

        StepVerifier.create(result)
                .expectNextMatches(user -> user.getEmail().equals("test@ksm.com")
                        && user.getRole().equals(Role.CLIENT))
                .verifyComplete();
    }

    @Test
    public void testGetUserById_Success() {
        Mockito.when(userRepositoryPort.findById(1L)).thenReturn(Mono.just(testUser));

        Mono<User> result = userService.getUserById(1L);

        StepVerifier.create(result)
                .expectNext(testUser)
                .verifyComplete();
    }

    @Test
    public void testGetUserById_NotFound() {
        Mockito.when(userRepositoryPort.findById(1L)).thenReturn(Mono.empty());

        Mono<User> result = userService.getUserById(1L);

        StepVerifier.create(result)
                .expectError(UserNotFoundException.class)
                .verify();
    }

    @Test
    public void testRequestProprietorRole() {
        testUser.setRole(Role.CLIENT);
        Mockito.when(userRepositoryPort.findById(1L)).thenReturn(Mono.just(testUser));
        Mockito.when(proprietorRequestRepositoryPort.save(any()))
                .thenReturn(Mono.just(new com.ksm.realestate.domain.model.ProprietorRequest()));
        Mockito.when(userRepositoryPort.save(any(User.class)))
                .thenAnswer(invocation -> Mono.just(invocation.getArgument(0)));

        Mono<User> result = userService.submitProprietorRequest(1L, "123", "Addr", "Motiv");

        StepVerifier.create(result)
                .expectNextMatches(user -> user.getRole().equals(Role.PROPRIETOR_PENDING))
                .verifyComplete();
    }
}