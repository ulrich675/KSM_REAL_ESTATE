package com.ksm.realestate.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;

/**
 * Comment domain model representing user feedback.
 *
 * @author Antigravity
 * @date 2026-07-08
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Comment {

    @NotNull
    private Long commentId;

    @NotNull
    private Long propertyId;

    @NotNull
    private Long userId;

    @NotNull
    @Size(max = 2000)
    private String content;

    private Integer rating;

    private Instant createdAt;
    private Instant updatedAt;
}
