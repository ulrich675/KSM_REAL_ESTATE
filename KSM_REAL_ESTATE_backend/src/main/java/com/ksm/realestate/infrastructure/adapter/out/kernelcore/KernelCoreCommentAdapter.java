package com.ksm.realestate.infrastructure.adapter.out.kernelcore;

import com.ksm.realestate.application.port.out.KernelCoreCommentPort;
import com.ksm.realestate.domain.exception.KernelCoreException;
import com.ksm.realestate.domain.model.KernelCommentCommand;
import com.ksm.realestate.domain.model.KernelCommentResult;
import com.ksm.realestate.infrastructure.config.KernelCoreProperties;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

/**
 * Adapter for comment and rating operations via kernel-core ratings service.
 *
 * <p>
 * Endpoints (from kernel-core.yowyob.com OpenAPI):
 * <ul>
 * <li>POST /api/v1/ratings/comments — CommentDTO</li>
 * <li>GET /api/v1/ratings/comments/by-entityId?entityId=...</li>
 * <li>DELETE /api/v1/ratings/comments/{commentId}</li>
 * <li>POST /api/v1/ratings/like-or-dislike — query params</li>
 * <li>GET /api/v1/ratings/totalLikes?entityId=...</li>
 * </ul>
 *
 * <p>
 * CommentDTO required fields: content, commentByUser (UUID), entityId,
 * entityType.
 *
 * @author ulrich675
 * @date 2026-07-10
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KernelCoreCommentAdapter implements KernelCoreCommentPort {

    private final WebClient kernelCoreWebClient;
    private final KernelCoreProperties properties;

    @Override
    public Mono<KernelCommentResult> addComment(KernelCommentCommand command) {
        Map<String, Object> body = new java.util.LinkedHashMap<>();
        body.put("content", command.getContent());
        body.put("commentByUser", command.getCommentByUser());
        if (command.getCommentByName() != null)
            body.put("commentByName", command.getCommentByName());
        body.put("entityId", command.getEntityId());
        body.put("entityType", command.getEntityType());

        return kernelCoreWebClient.post()
                .uri("/api/v1/ratings/comments")
                .header("X-Tenant-Id", properties.getTenantId())
                .bodyValue(body)
                .retrieve()
                .onStatus(s -> s.isError(), r -> r.bodyToMono(KernelErrorResponse.class)
                        .flatMap(err -> Mono.<Throwable>error(new KernelCoreException(
                                err.getErrorCode() != null ? err.getErrorCode() : "COMMENT_FAILED",
                                err.getMessage() != null ? err.getMessage() : "Comment creation failed")))
                        .switchIfEmpty(
                                Mono.<Throwable>error(
                                        new KernelCoreException("COMMENT_FAILED", "Comment creation failed"))))
                .bodyToMono(CommentApiResponse.class)
                .map(resp -> mapToResult(resp.getData()));
    }

    @Override
    public Flux<KernelCommentResult> getCommentsByEntity(String entityId) {
        return kernelCoreWebClient.get()
                .uri(u -> u.path("/api/v1/ratings/comments/by-entityId")
                        .queryParam("entityId", entityId)
                        .build())
                .header("X-Tenant-Id", properties.getTenantId())
                .retrieve()
                .onStatus(s -> s.isError(), r -> r.bodyToMono(KernelErrorResponse.class)
                        .flatMap(err -> Mono.<Throwable>error(new KernelCoreException(
                                err.getErrorCode() != null ? err.getErrorCode() : "COMMENTS_FETCH_FAILED",
                                err.getMessage() != null ? err.getMessage() : "Failed to fetch comments"))))
                .bodyToMono(CommentListApiResponse.class)
                .flatMapMany(resp -> {
                    if (resp.getData() == null)
                        return Flux.empty();
                    return Flux.fromIterable(resp.getData()).map(this::mapToResult);
                });
    }

    @Override
    public Mono<Void> deleteComment(String commentId) {
        return kernelCoreWebClient.delete()
                .uri("/api/v1/ratings/comments/{commentId}", commentId)
                .header("X-Tenant-Id", properties.getTenantId())
                .retrieve()
                .onStatus(s -> s.isError(), r -> r.bodyToMono(KernelErrorResponse.class)
                        .flatMap(err -> Mono.<Throwable>error(new KernelCoreException(
                                err.getErrorCode() != null ? err.getErrorCode() : "DELETE_COMMENT_FAILED",
                                err.getMessage() != null ? err.getMessage() : "Comment deletion failed"))))
                .bodyToMono(Void.class);
    }

    @Override
    public Mono<Void> likeOrDislike(String userId, String entityId, String entityType, boolean isLike) {
        return kernelCoreWebClient.post()
                .uri(u -> u.path("/api/v1/ratings/like-or-dislike")
                        .queryParam("userId", userId)
                        .queryParam("entityId", entityId)
                        .queryParam("entityType", entityType)
                        .queryParam("isLike", isLike)
                        .build())
                .header("X-Tenant-Id", properties.getTenantId())
                .retrieve()
                .onStatus(s -> s.isError(), r -> r.bodyToMono(KernelErrorResponse.class)
                        .flatMap(err -> Mono.<Throwable>error(new KernelCoreException(
                                err.getErrorCode() != null ? err.getErrorCode() : "LIKE_FAILED",
                                err.getMessage() != null ? err.getMessage() : "Like/dislike failed"))))
                .bodyToMono(Void.class);
    }

    @Override
    public Mono<Long> getTotalLikes(String entityId) {
        return kernelCoreWebClient.get()
                .uri(u -> u.path("/api/v1/ratings/totalLikes")
                        .queryParam("entityId", entityId)
                        .build())
                .header("X-Tenant-Id", properties.getTenantId())
                .retrieve()
                .bodyToMono(Long.class)
                .defaultIfEmpty(0L);
    }

    private KernelCommentResult mapToResult(CommentData data) {
        if (data == null)
            return new KernelCommentResult();
        return KernelCommentResult.builder()
                .id(data.getId())
                .content(data.getContent())
                .commentByUser(data.getCommentByUser())
                .commentByName(data.getCommentByName())
                .entityId(data.getEntityId())
                .entityType(data.getEntityType())
                .createdAt(data.getCreatedAt())
                .build();
    }

    // ─── inner DTOs ──────────────────────────────────────────────────────────

    @Data
    public static class CommentApiResponse {
        private String status;
        private CommentData data;
    }

    @Data
    public static class CommentListApiResponse {
        private String status;
        private List<CommentData> data;
    }

    @Data
    public static class CommentData {
        private String id;
        private String content;
        private String commentByUser;
        private String commentByName;
        private String entityId;
        private String entityType;
        private String createdAt;
    }

    @Data
    public static class KernelErrorResponse {
        private String errorCode;
        private String message;
    }
}
