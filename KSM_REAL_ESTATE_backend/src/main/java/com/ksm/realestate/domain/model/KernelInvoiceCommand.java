package com.ksm.realestate.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Command object sent to kernel-core billing to create an invoice.
 * Maps to {@code CreateInvoiceRequest} in the kernel-core OpenAPI spec.
 *
 * <p>
 * Required fields (as per OpenAPI): organizationId, customerThirdPartyId,
 * currency.
 *
 * <p>
 * <b>Stable port contract</b> — internal logic (adapter mapping) lives in
 * {@code KernelCorePaymentAdapter}, not here.
 *
 * @author Antigravity
 * @date 2026-07-10
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KernelInvoiceCommand {
    /** kernel-core organisation UUID (from ${KERNEL_CORE_ORGANIZATION_ID}) */
    private String organizationId;
    /** Third-party UUID representing the customer in kernel-core */
    private String customerThirdPartyId;
    /** ISO currency code, e.g. "XAF" */
    private String currency;
    /** Optional: reference to an external order */
    private String orderId;
    /** Optional: KSM property ID used as the billed product reference */
    private String productId;
    /** Optional: invoice number override */
    private String invoiceNumber;
    /** Quantity of units billed (default 1) */
    private Double quantity;
    /** Unit price */
    private Double unitPrice;
}
