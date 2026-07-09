package com.ksm.realestate.application.port.out;

import com.ksm.realestate.domain.model.Comment;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Outbound port for comment persistence.
 * Comments are managed entirely locally (Option A — no kernel-core equivalent
 * found).
 *
 * @author Antigravity
 * @date 2026-07-09
 */
public interface CommentRepositoryPort {
    Mono<Comment> save(Comment comment);

    Mono<Comment> findById(Long commentId);

    Flux<Comment> findByPropertyId(Long propertyId);

    Flux<Comment> findByUserId(Long userId);

    Mono<Void> deleteById(Long commentId);
}
