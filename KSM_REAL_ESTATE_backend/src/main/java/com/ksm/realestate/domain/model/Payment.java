package com.ksm.realestate.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * Payment domain model representing a completed transaction.
 *
 * @author Antigravity
 * @date 2026-07-08
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Payment {

    @NotNull
    private Long paymentId;

    @NotNull
    private Long propertyId;

    @NotNull
    private Long userId;

    @NotNull
    private BigDecimal amount;

    @NotNull
    private String currency;

    @NotNull
    private Instant paidAt;

    @NotNull
    private String status;

    private String receiptPdfUrl;
}