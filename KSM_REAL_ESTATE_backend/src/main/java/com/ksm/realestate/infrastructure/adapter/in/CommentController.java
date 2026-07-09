package com.ksm.realestate.infrastructure.adapter.in;

import com.ksm.realestate.application.service.CommentService;
import com.ksm.realestate.domain.model.Comment;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.time.Instant;

/**
 * REST controller for managing property comments (stored locally).
 *
 * @author Antigravity
 * @date 2026-07-09
 */
@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

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
}
