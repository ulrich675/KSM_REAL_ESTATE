package com.ksm.realestate.application.port.out;

import com.ksm.realestate.domain.model.KernelCommentCommand;
import com.ksm.realestate.domain.model.KernelCommentResult;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Outbound port for comment and rating operations via kernel-core ratings
 * service.
 *
 * <p>
 * Endpoints:
 * <ul>
 * <li>POST /api/v1/ratings/comments — create a comment (CommentDTO)</li>
 * <li>GET /api/v1/ratings/comments/by-entityId?entityId=... — list by
 * entity</li>
 * <li>DELETE /api/v1/ratings/comments/{commentId} — delete a comment</li>
 * <li>POST /api/v1/ratings/like-or-dislike — like or dislike entity</li>
 * <li>GET /api/v1/ratings/totalLikes?entityId=... — total likes</li>
 * </ul>
 *
 * @author ulrich675
 * @date 2026-07-10
 */
public interface KernelCoreCommentPort {

    /**
     * Posts a comment on a KSM entity (e.g. a property) via ratings-core.
     *
     * @param command the comment details (content, commentByUser, entityId,
     *                entityType required)
     * @return the created comment result with its UUID
     */
    Mono<KernelCommentResult> addComment(KernelCommentCommand command);

    /**
     * Retrieves all comments for a given entity.
     *
     * @param entityId the entity UUID or identifier (e.g. propertyId.toString())
     * @return a flux of comment results
     */
    Flux<KernelCommentResult> getCommentsByEntity(String entityId);

    /**
     * Deletes a specific comment.
     *
     * @param commentId the UUID of the comment to delete
     * @return empty Mono on success
     */
    Mono<Void> deleteComment(String commentId);

    /**
     * Registers a like or dislike on an entity.
     *
     * @param userId     the kernel-core actor UUID
     * @param entityId   the entity identifier
     * @param entityType the type (e.g. "PROPERTY")
     * @param isLike     true for like, false for dislike
     * @return empty Mono on success
     */
    Mono<Void> likeOrDislike(String userId, String entityId, String entityType, boolean isLike);

    /**
     * Gets the total number of likes for an entity.
     *
     * @param entityId the entity identifier
     * @return the like count
     */
    Mono<Long> getTotalLikes(String entityId);
}
