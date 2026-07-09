package com.ksm.realestate.infrastructure.adapter.out.persistence;

import com.ksm.realestate.application.port.out.CommentRepositoryPort;
import com.ksm.realestate.domain.model.Comment;
import com.ksm.realestate.infrastructure.entity.CommentEntity;
import com.ksm.realestate.infrastructure.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.time.Instant;

/**
 * R2DBC-backed adapter for comment persistence.
 *
 * @author Antigravity
 * @date 2026-07-09
 */
@Component
@RequiredArgsConstructor
public class CommentRepositoryAdapter implements CommentRepositoryPort {

    private final CommentRepository commentRepository;

    @Override
    public Mono<Comment> save(Comment comment) {
        CommentEntity entity = toEntity(comment);
        return commentRepository.save(entity).map(this::toDomain);
    }

    @Override
    public Mono<Comment> findById(Long commentId) {
        return commentRepository.findById(commentId).map(this::toDomain);
    }

    @Override
    public Flux<Comment> findByPropertyId(Long propertyId) {
        return commentRepository.findByPropertyId(propertyId).map(this::toDomain);
    }

    @Override
    public Flux<Comment> findByUserId(Long userId) {
        return commentRepository.findByUserId(userId).map(this::toDomain);
    }

    @Override
    public Mono<Void> deleteById(Long commentId) {
        return commentRepository.deleteById(commentId);
    }

    private CommentEntity toEntity(Comment c) {
        CommentEntity e = new CommentEntity();
        e.setCommentId(c.getCommentId());
        e.setPropertyId(c.getPropertyId());
        e.setUserId(c.getUserId());
        e.setContent(c.getContent());
        e.setRating(c.getRating());
        e.setCreatedAt(c.getCreatedAt());
        e.setUpdatedAt(c.getUpdatedAt());
        return e;
    }

    private Comment toDomain(CommentEntity e) {
        return Comment.builder()
                .commentId(e.getCommentId())
                .propertyId(e.getPropertyId())
                .userId(e.getUserId())
                .content(e.getContent())
                .rating(e.getRating())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
