package com.ksm.realestate.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Authentication result returned from the external kernel-core.
 * It contains tokens, expiration, and any MFA transition details.
 *
 * @author Antigravity
 * @date 2026-07-09
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KernelAuthResult {
    private String accessToken;
    private String refreshToken;
    private Long expiresInMs;
    private String tokenType;
    private String nextStep; // e.g. "CONFIRM_MFA"
    private String mfaToken;
    private Boolean mfaRequired;
}
