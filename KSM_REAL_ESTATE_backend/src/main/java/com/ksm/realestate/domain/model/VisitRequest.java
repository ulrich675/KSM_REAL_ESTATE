package com.ksm.realestate.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

/**
 * VisitRequest domain model representing request to visit a property.
 *
 * @author Antigravity
 * @date 2026-07-08
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VisitRequest {

    @NotNull
    private Long requestId;

    @NotNull
    private Long propertyId;

    @NotNull
    private Long userId;

    @NotNull
    private Instant requestedAt;

    @NotNull
    private String status;

    private Instant updatedAt;
}
