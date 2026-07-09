package com.ksm.realestate.domain.exception;

/**
 * Exception thrown when a user is not found.
 *
 * @author Antigravity
 * @date 2026-07-08
 */
public class UserNotFoundException extends BusinessException {

    public UserNotFoundException(Long userId) {
        super("USER_NOT_FOUND", "User with ID " + userId + " not found.");
    }

    public UserNotFoundException(String message) {
        super("USER_NOT_FOUND", message);
    }
}
