package com.ksm.realestate.infrastructure.adapter.in;

import com.ksm.realestate.application.service.CommentService;
import com.ksm.realestate.domain.model.Comment;
import com.ksm.realestate.domain.model.KernelCommentResult;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;

/**
 * REST controller for comment and rating operations.
 *
 * <p>
 * Local comments (PostgreSQL) and kernel-core ratings (likes, kernel comments)
 * are exposed through a unified API.
 *
 * @author Antigravity
 * @date 2026-07-10
 */
@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // ─── Local comments (PostgreSQL) ─────────────────────────────────────────

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse<Comment>> addComment(@RequestBody Comment comment) {
        return commentService.addComment(comment)
                .map(saved -> ApiResponse.<Comment>builder()
                        .status("SUCCESS")
                        .message("Comment added successfully")
                        .data(saved)
                        .timestamp(Instant.now())
                        .errors(null)
                        .build());
    }

    @GetMapping("/property/{propertyId}")
    public Flux<Comment> getByProperty(@PathVariable Long propertyId) {
        return commentService.getCommentsByProperty(propertyId);
    }

    @GetMapping("/user/{userId}")
    public Flux<Comment> getByUser(@PathVariable Long userId) {
        return commentService.getCommentsByUser(userId);
    }

    @DeleteMapping("/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> deleteComment(@PathVariable Long commentId) {
        return commentService.deleteComment(commentId);
    }

    // ─── Kernel-core ratings ─────────────────────────────────────────────────

    /**
     * Fetches comments for a property directly from kernel-core ratings-core.
     * GET /api/comments/kernel/property/{propertyId}
     */
    @GetMapping("/kernel/property/{propertyId}")
    public Flux<KernelCommentResult> getKernelCommentsByProperty(@PathVariable Long propertyId) {
        return commentService.getKernelCommentsByProperty(propertyId);
    }

    /**
     * Like or dislike a property via kernel-core.
     * POST /api/comments/property/{propertyId}/like?kernelActorId=...&isLike=true
     */
    @PostMapping("/property/{propertyId}/like")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> likeOrDislike(
            @PathVariable Long propertyId,
            @RequestParam String kernelActorId,
            @RequestParam(defaultValue = "true") boolean isLike) {
        return commentService.likeOrDislikeProperty(kernelActorId, propertyId, isLike);
    }

    /**
     * Get total likes for a property.
     * GET /api/comments/property/{propertyId}/likes/total
     */
    @GetMapping("/property/{propertyId}/likes/total")
    public Mono<ApiResponse<Long>> getTotalLikes(@PathVariable Long propertyId) {
        return commentService.getTotalLikes(propertyId)
                .map(count -> ApiResponse.<Long>builder()
                        .status("SUCCESS")
                        .message("Total likes retrieved")
                        .data(count)
                        .timestamp(Instant.now())
                        .errors(null)
                        .build());
    }
}
