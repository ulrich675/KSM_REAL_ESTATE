package com.ksm.realestate.domain.exception;

/**
 * Exception thrown when a payment processing fails.
 *
 * @author Antigravity
 * @date 2026-07-08
 */
public class PaymentFailedException extends BusinessException {
    public PaymentFailedException(String message) {
        super("PAYMENT_FAILED", message);
    }
}
