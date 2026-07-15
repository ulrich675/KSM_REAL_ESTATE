package com.ksm.realestate.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

/**
 * Response payload representing a visit request.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VisitRequestResponse {

    private Long requestId;
    private Long propertyId;
    private Long userId;
    private Instant requestedAt;

    private String status;

    private String type;

    private Instant visitDate;

    private Instant updatedAt;
}
