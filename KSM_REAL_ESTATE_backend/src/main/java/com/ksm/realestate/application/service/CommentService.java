package com.ksm.realestate.application.service;

import com.ksm.realestate.application.port.out.CommentRepositoryPort;
import com.ksm.realestate.application.port.out.KernelCoreCommentPort;
import com.ksm.realestate.domain.model.Comment;
import com.ksm.realestate.domain.model.KernelCommentCommand;
import com.ksm.realestate.domain.model.KernelCommentResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;

/**
 * Application service for managing property comments.
 *
 * <p>
 * Dual-write strategy:
 * <ol>
 * <li>Persist locally (Option A — local relational DB) for fast queries and FK
 * integrity.</li>
 * <li>Delegate to kernel-core ratings-core in parallel (non-blocking,
 * best-effort).</li>
 * </ol>
 *
 * <p>
 * Ratings: like/dislike and like count delegate entirely to kernel-core
 * (no local equivalent needed).
 *
 * @author ulrich675
 * @date 2026-07-10
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepositoryPort commentRepositoryPort;
    private final KernelCoreCommentPort kernelCoreCommentPort;

    /**
     * Adds a comment locally and posts it to kernel-core ratings.
     */
    public Mono<Comment> addComment(Comment comment) {
        Instant now = Instant.now();
        comment.setCreatedAt(now);
        comment.setUpdatedAt(now);

        // 1. Save locally
        Mono<Comment> localSave = commentRepositoryPort.save(comment);

        // 2. Send to kernel-core (best-effort, non-blocking)
        KernelCommentCommand kernelCmd = KernelCommentCommand.builder()
                .content(comment.getContent())
                // commentByUser must be the kernel actorId UUID; fall back to userId string
                .commentByUser(comment.getUserId() != null ? comment.getUserId().toString() : "unknown")
                .entityId(comment.getPropertyId() != null ? comment.getPropertyId().toString() : "unknown")
                .entityType("PROPERTY")
                .build();

        kernelCoreCommentPort.addComment(kernelCmd)
                .doOnError(e -> log.warn("kernel-core ratings sync failed (non-blocking): {}", e.getMessage()))
                .onErrorResume(e -> Mono.empty())
                .subscribe();

        return localSave;
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

    // ─── kernel-core ratings (like/dislike) ──────────────────────────────────

    /**
     * Registers a like or dislike on a property via kernel-core ratings.
     *
     * @param kernelActorId kernel-core actor UUID of the user
     * @param propertyId    local property ID (used as entityId)
     * @param isLike        true = like, false = dislike
     */
    public Mono<Void> likeOrDislikeProperty(String kernelActorId, Long propertyId, boolean isLike) {
        return kernelCoreCommentPort.likeOrDislike(
                kernelActorId, propertyId.toString(), "PROPERTY", isLike);
    }

    /**
     * Returns the total number of likes for a property from kernel-core.
     */
    public Mono<Long> getTotalLikes(Long propertyId) {
        return kernelCoreCommentPort.getTotalLikes(propertyId.toString());
    }

    /**
     * Fetches comments for a property directly from kernel-core ratings.
     */
    public Flux<KernelCommentResult> getKernelCommentsByProperty(Long propertyId) {
        return kernelCoreCommentPort.getCommentsByEntity(propertyId.toString());
    }
}
