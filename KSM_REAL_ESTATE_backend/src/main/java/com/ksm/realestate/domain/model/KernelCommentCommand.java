package com.ksm.realestate.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Command object to post a comment on a KSM entity (e.g. a property) via
 * the kernel-core ratings service.
 *
 * <p>
 * Maps to {@code CommentDTO} in POST /api/v1/ratings/comments:
 * <ul>
 * <li>content — required</li>
 * <li>commentByUser — required (UUID of the kernel-core actor)</li>
 * <li>entityId — required (e.g. propertyId.toString())</li>
 * <li>entityType — required (e.g. "PROPERTY")</li>
 * </ul>
 *
 * @author ulrich675
 * @date 2026-07-10
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KernelCommentCommand {
    /** Comment body text */
    private String content;
    /** UUID of the commenting user (kernel-core actorId) */
    private String commentByUser;
    /** Display name of the commenter */
    private String commentByName;
    /** Entity being commented on (e.g. propertyId.toString()) */
    private String entityId;
    /** Entity type discriminator (e.g. "PROPERTY") */
    private String entityType;
}
