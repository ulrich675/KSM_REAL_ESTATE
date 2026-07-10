package com.ksm.realestate.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Result returned after creating an invoice in kernel-core billing.
 * Maps to {@code InvoiceResponse} in the kernel-core OpenAPI spec.
 *
 * @author Antigravity
 * @date 2026-07-10
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KernelInvoiceResult {
    /** UUID of the created invoice in kernel-core */
    private String invoiceId;
    private String invoiceNumber;
    private String status;
    private String paymentStatus;
    private Double totalAmount;
    private Double settledAmount;
    private Double outstandingAmount;
    private String currency;
    private String organizationId;
    private String customerThirdPartyId;
}
