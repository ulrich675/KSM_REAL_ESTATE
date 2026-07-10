package com.ksm.realestate.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Result returned from kernel-core ratings after posting or fetching a comment.
 *
 * @author Antigravity
 * @date 2026-07-10
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KernelCommentResult {
    /** UUID of the comment in kernel-core */
    private String id;
    private String content;
    private String commentByUser;
    private String commentByName;
    private String entityId;
    private String entityType;
    private String createdAt;
}
