package com.ksm.realestate.application.port.out;

import com.ksm.realestate.domain.model.KernelInvoiceCommand;
import com.ksm.realestate.domain.model.KernelInvoiceResult;
import reactor.core.publisher.Mono;

/**
 * Outbound port for payment/billing operations via kernel-core accounting
 * service.
 *
 * <p>
 * Endpoints:
 * <ul>
 * <li>POST /api/accounting/invoices — create invoice
 * (CreateInvoiceRequest)</li>
 * <li>POST /api/accounting/invoices/{invoiceId}/post — post/validate
 * invoice</li>
 * </ul>
 *
 * @author ulrich675
 * @date 2026-07-10
 */
public interface KernelCorePaymentPort {

    /**
     * Creates and posts an invoice in kernel-core billing.
     * Internally calls POST /api/accounting/invoices then /{id}/post.
     *
     * @param command the invoice details (organizationId, customerThirdPartyId,
     *                currency required)
     * @return the created and posted invoice result with status and identifiers
     */
    Mono<KernelInvoiceResult> createInvoice(KernelInvoiceCommand command);
}
