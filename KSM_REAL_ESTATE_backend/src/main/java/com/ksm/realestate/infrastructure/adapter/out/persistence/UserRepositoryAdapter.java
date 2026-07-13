package com.ksm.realestate.infrastructure.adapter.out.persistence;

import com.ksm.realestate.application.port.out.UserRepositoryPort;
import com.ksm.realestate.domain.model.Role;
import com.ksm.realestate.domain.model.User;
import com.ksm.realestate.infrastructure.mapper.UserMapper;
import com.ksm.realestate.infrastructure.repository.UserRepository;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Adapter that bridges the domain {@link UserRepositoryPort} with the Spring
 * Data R2DBC
 * {@link UserRepository}. It converts between domain objects and persistence
 * entities using
 * {@link UserMapper}.
 */
@Component
public class UserRepositoryAdapter implements UserRepositoryPort {

    private final UserRepository repository;
    private final UserMapper mapper;

    public UserRepositoryAdapter(UserRepository repository, UserMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public Mono<User> save(User user) {
        return repository.save(mapper.toEntity(user))
                .map(mapper::toDomain);
    }

    @Override
    public Mono<User> findById(Long userId) {
        return repository.findById(userId)
                .map(mapper::toDomain);
    }

    @Override
    public Mono<User> findByEmail(String email) {
        return repository.findByEmail(email)
                .singleOrEmpty()
                .map(mapper::toDomain);
    }

    @Override
    public Flux<User> findAll() {
        return repository.findAll()
                .map(mapper::toDomain);
    }

    @Override
    public Flux<User> findByRole(Role role) {
        return repository.findByRole(role.name())
                .map(mapper::toDomain);
    }

    @Override
    public Mono<Void> deleteById(Long userId) {
        return repository.deleteById(userId);
    }
}
