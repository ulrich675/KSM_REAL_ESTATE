package com.ksm.realestate.application.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for creating a visit request.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VisitRequestCreateRequest {

    @NotNull
    private Long propertyId;

    @NotNull
    private Long userId;

    private String type;

    private java.time.Instant visitDate;
}
