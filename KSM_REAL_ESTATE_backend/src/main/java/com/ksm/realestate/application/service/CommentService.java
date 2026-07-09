package com.ksm.realestate.application.service;

import com.ksm.realestate.application.port.out.CommentRepositoryPort;
import com.ksm.realestate.domain.model.Comment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.time.Instant;

/**
 * Application service for managing property comments (stored locally, Option
 * A).
 * No kernel-core equivalent was found among the 20 documented modules.
 *
 * @author Antigravity
 * @date 2026-07-09
 */
@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepositoryPort commentRepositoryPort;

    public Mono<Comment> addComment(Comment comment) {
        Instant now = Instant.now();
        comment.setCreatedAt(now);
        comment.setUpdatedAt(now);
        return commentRepositoryPort.save(comment);
    }

    public Flux<Comment> getCommentsByProperty(Long propertyId) {
        return commentRepositoryPort.findByPropertyId(propertyId);
    }

    public Flux<Comment> getCommentsByUser(Long userId) {
        return commentRepositoryPort.findByUserId(userId);
    }

    public Mono<Void> deleteComment(Long commentId) {
        return commentRepositoryPort.deleteById(commentId);
    }
}
