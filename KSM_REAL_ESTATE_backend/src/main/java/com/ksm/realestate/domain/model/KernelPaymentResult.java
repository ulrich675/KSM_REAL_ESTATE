package com.ksm.realestate.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payment processing result returned by the external billing-core.
 *
 * @author Antigravity
 * @date 2026-07-09
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KernelPaymentResult {
    private String status;
    private String paymentId;
    private String receiptReference;
}
