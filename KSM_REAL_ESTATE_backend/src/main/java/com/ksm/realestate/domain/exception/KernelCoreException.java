package com.ksm.realestate.domain.exception;

/**
 * Exception thrown when the external kernel-core service returns an error
 * or communication with it fails.
 *
 * @author ulrich675
 * @date 2026-07-09
 */
public class KernelCoreException extends BusinessException {

    public KernelCoreException(String errorCode, String errorMessage) {
        super(errorCode, errorMessage);
    }

    public KernelCoreException(String errorMessage) {
        super("KERNEL_CORE_ERROR", errorMessage);
    }
}
