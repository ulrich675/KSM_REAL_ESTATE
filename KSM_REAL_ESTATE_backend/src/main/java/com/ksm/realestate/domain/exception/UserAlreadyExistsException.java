package com.ksm.realestate.domain.exception;

/**
 * Exception thrown when attempting to register a user that already exists.
 *
 * @author Antigravity
 * @date 2026-07-08
 */
public class UserAlreadyExistsException extends BusinessException {
    public UserAlreadyExistsException(String email) {
        super("USER_ALREADY_EXISTS", "User with email " + email + " already exists.");
    }
}
