package com.ksm.realestate.domain.exception;

import lombok.Getter;
import lombok.AllArgsConstructor;

/**
 * Base business exception for the application.
 *
 * @author Antigravity
 * @date 2026-07-08
 */
@Getter
@AllArgsConstructor
public class BusinessException extends RuntimeException {
    private final String errorCode;
    private final String errorMessage;

    public BusinessException(String errorMessage) {
        super(errorMessage);
        this.errorCode = "BUSINESS_ERROR";
        this.errorMessage = errorMessage;
    }
}
