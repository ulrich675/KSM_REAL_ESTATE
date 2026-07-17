package com.ksm.realestate.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * Response payload representing payment status and receipt reference.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentResponse {

    private Long paymentId;
    private Long propertyId;
    private Long userId;
    private BigDecimal amount;
    private String currency;
    private Instant paidAt;
    private String status;
    private String receiptPdfUrl; // Mock URL for receipt download
    private String type;
}
