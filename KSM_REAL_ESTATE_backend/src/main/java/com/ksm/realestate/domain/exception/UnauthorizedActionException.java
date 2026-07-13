package com.ksm.realestate.domain.exception;

/**
 * Exception thrown when a user attempts an unauthorized action.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
public class UnauthorizedActionException extends BusinessException {
    public UnauthorizedActionException(String message) {
        super("UNAUTHORIZED_ACTION", message);
    }
}
