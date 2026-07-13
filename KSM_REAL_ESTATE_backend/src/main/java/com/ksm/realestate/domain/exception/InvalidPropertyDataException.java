package com.ksm.realestate.domain.exception;

/**
 * Exception thrown when property data is invalid.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
public class InvalidPropertyDataException extends BusinessException {
    public InvalidPropertyDataException(String message) {
        super("INVALID_PROPERTY_DATA", message);
    }
}
