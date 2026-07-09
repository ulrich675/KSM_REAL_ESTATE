package com.ksm.realestate.infrastructure.adapter.in;

import com.ksm.realestate.application.dto.request.PaymentCreateRequest;
import com.ksm.realestate.application.dto.response.PaymentResponse;
import com.ksm.realestate.application.service.PaymentService;
import com.ksm.realestate.infrastructure.mapper.PaymentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import java.time.Instant;

/**
 * REST controller for handling payment processing.
 *
 * @author Antigravity
 * @date 2026-07-08
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentMapper paymentMapper;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ApiResponse<PaymentResponse>> processPayment(@RequestBody PaymentCreateRequest request) {
        return paymentService.process(paymentMapper.toDomain(request))
                .map(paymentMapper::toResponse)
                .map(response -> {
                    // Inject a mock receipt download URL
                    response.setReceiptPdfUrl("/api/payments/" + response.getPaymentId() + "/receipt");
                    return ApiResponse.<PaymentResponse>builder()
                            .status("SUCCESS")
                            .message("Payment processed successfully")
                            .data(response)
                            .timestamp(Instant.now())
                            .errors(null)
                            .build();
                });
    }
}
