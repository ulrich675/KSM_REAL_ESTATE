package com.ksm.realestate.infrastructure.adapter.out.kernelcore;

import com.ksm.realestate.application.port.out.KernelCorePaymentPort;
import com.ksm.realestate.domain.exception.KernelCoreException;
import com.ksm.realestate.domain.model.KernelInvoiceCommand;
import com.ksm.realestate.domain.model.KernelInvoiceResult;
import com.ksm.realestate.infrastructure.config.KernelCoreProperties;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Adapter for payment/billing via kernel-core accounting service.
 *
 * <p>
 * Flow (from OpenAPI kernel-core.yowyob.com):
 * <ol>
 * <li>POST /api/accounting/invoices — CreateInvoiceRequest →
 * InvoiceResponse</li>
 * <li>POST /api/accounting/invoices/{invoiceId}/post — posts/validates the
 * invoice</li>
 * </ol>
 *
 * <p>
 * Required fields (CreateInvoiceRequest): organizationId, customerThirdPartyId,
 * currency.
 *
 * @author ulrich675
 * @date 2026-07-10
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KernelCorePaymentAdapter implements KernelCorePaymentPort {

    private final WebClient kernelCoreWebClient;
    private final KernelCoreProperties properties;

    @Override
    public Mono<KernelInvoiceResult> createInvoice(KernelInvoiceCommand command) {
        return ReactiveSecurityContextHolder.getContext()
                .map(ctx -> {
                    if (ctx.getAuthentication() != null && ctx.getAuthentication().getCredentials() != null) {
                        return ctx.getAuthentication().getCredentials().toString();
                    }
                    return "";
                })
                .defaultIfEmpty("")
                .flatMap(token -> {
                    // Build CreateInvoiceRequest body
                    Map<String, Object> body = new LinkedHashMap<>();
                    body.put("organizationId", command.getOrganizationId() != null
                            ? command.getOrganizationId()
                            : properties.getOrganizationId());
                    body.put("customerThirdPartyId", command.getCustomerThirdPartyId());
                    body.put("currency", command.getCurrency() != null ? command.getCurrency() : "XAF");
                    if (command.getOrderId() != null)
                        body.put("orderId", command.getOrderId());
                    if (command.getProductId() != null)
                        body.put("productId", command.getProductId());
                    if (command.getQuantity() != null)
                        body.put("quantity", command.getQuantity());
                    if (command.getUnitPrice() != null)
                        body.put("unitPrice", command.getUnitPrice());
                    if (command.getInvoiceNumber() != null)
                        body.put("invoiceNumber", command.getInvoiceNumber());

                    WebClient.RequestHeadersSpec<?> req = kernelCoreWebClient.post()
                            .uri("/api/accounting/invoices")
                            .header("X-Tenant-Id", properties.getTenantId())
                            .header("X-Organization-Id", properties.getOrganizationId())
                            .bodyValue(body);

                    if (token != null && !token.isEmpty()) {
                        req = ((WebClient.RequestBodySpec) kernelCoreWebClient.post()
                                .uri("/api/accounting/invoices")
                                .header("X-Tenant-Id", properties.getTenantId())
                                .header("X-Organization-Id", properties.getOrganizationId())
                                .header("Authorization", "Bearer " + token))
                                .bodyValue(body);
                    }

                    return req.retrieve()
                            .onStatus(s -> s.isError(), r -> r.bodyToMono(KernelErrorResponse.class)
                                    .flatMap(err -> Mono.<Throwable>error(new KernelCoreException(
                                            err.getErrorCode() != null ? err.getErrorCode() : "INVOICE_FAILED",
                                            err.getMessage() != null ? err.getMessage() : "Invoice creation failed")))
                                    .switchIfEmpty(Mono.<Throwable>error(
                                            new KernelCoreException("INVOICE_FAILED", "Invoice creation failed"))))
                            .bodyToMono(InvoiceApiResponse.class)
                            .flatMap(resp -> {
                                if (resp.getData() == null || resp.getData().getId() == null) {
                                    return Mono
                                            .error(new KernelCoreException("INVOICE_FAILED", "No invoice ID returned"));
                                }
                                String invoiceId = resp.getData().getId();
                                log.info("Invoice created: {}, posting now", invoiceId);
                                // Step 2: post the invoice
                                return postInvoice(invoiceId, token)
                                        .thenReturn(mapToResult(resp.getData()));
                            });
                });
    }

    /** POST /api/accounting/invoices/{invoiceId}/post */
    private Mono<Void> postInvoice(String invoiceId, String token) {
        WebClient.RequestHeadersSpec<?> req = kernelCoreWebClient.post()
                .uri("/api/accounting/invoices/{id}/post", invoiceId)
                .header("X-Tenant-Id", properties.getTenantId())
                .header("X-Organization-Id", properties.getOrganizationId());

        if (token != null && !token.isEmpty()) {
            req = kernelCoreWebClient.post()
                    .uri("/api/accounting/invoices/{id}/post", invoiceId)
                    .header("X-Tenant-Id", properties.getTenantId())
                    .header("X-Organization-Id", properties.getOrganizationId())
                    .header("Authorization", "Bearer " + token);
        }

        return req.retrieve()
                .onStatus(s -> s.isError(), r -> r.bodyToMono(KernelErrorResponse.class)
                        .flatMap(err -> Mono.<Throwable>error(new KernelCoreException(
                                err.getErrorCode() != null ? err.getErrorCode() : "POST_INVOICE_FAILED",
                                err.getMessage() != null ? err.getMessage() : "Invoice posting failed")))
                        .switchIfEmpty(Mono.<Throwable>error(
                                new KernelCoreException("POST_INVOICE_FAILED", "Invoice posting failed"))))
                .bodyToMono(Void.class)
                .onErrorResume(e -> {
                    log.warn("Post invoice {} communication error — invoice exists but not posted: {}", invoiceId,
                            e.getMessage());
                    return Mono.empty();
                });
    }

    private KernelInvoiceResult mapToResult(InvoiceData data) {
        return KernelInvoiceResult.builder()
                .invoiceId(data.getId())
                .invoiceNumber(data.getInvoiceNumber())
                .status(data.getStatus())
                .paymentStatus(data.getPaymentStatus())
                .totalAmount(data.getTotalAmount())
                .settledAmount(data.getSettledAmount())
                .outstandingAmount(data.getOutstandingAmount())
                .currency(data.getCurrency())
                .organizationId(data.getOrganizationId())
                .customerThirdPartyId(data.getCustomerThirdPartyId())
                .build();
    }

    // ─── inner DTOs ──────────────────────────────────────────────────────────

    @Data
    public static class InvoiceApiResponse {
        private String status;
        private InvoiceData data;
    }

    /** Maps InvoiceResponse from kernel-core OpenAPI */
    @Data
    public static class InvoiceData {
        private String id;
        private String tenantId;
        private String organizationId;
        private String customerThirdPartyId;
        private String orderId;
        private String productId;
        private String invoiceNumber;
        private Double quantity;
        private Double unitPrice;
        private Double totalAmount;
        private Double settledAmount;
        private Double outstandingAmount;
        private String currency;
        private String status;
        private String paymentStatus;
    }

    @Data
    public static class KernelErrorResponse {
        private String errorCode;
        private String message;
    }
}
