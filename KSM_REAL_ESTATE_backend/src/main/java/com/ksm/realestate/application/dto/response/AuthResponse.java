package com.ksm.realestate.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for authentication response containing the JWT token.
 *
 * @author Antigravity
 * @date 2026-07-08
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String tokenType;
    private Long expiresInMs;
    private UserResponse user;
    private String nextStep;
    private String mfaToken;
}