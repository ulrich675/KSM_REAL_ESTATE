package com.ksm.realestate.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Authentication result returned from the external kernel-core.
 * Fields aligned with {@code LoginResponse} schema from
 * https://kernel-core.yowyob.com/swagger-ui/index.html
 *
 * @author Antigravity
 * @date 2026-07-10
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KernelAuthResult {
    /** kernel-core internal user UUID */
    private String id;
    /** UUID of the actor within the organisation scope */
    private String actorId;
    private String accessToken;
    private String sessionToken;
    private String refreshToken;
    /**
     * Expiry in seconds as returned by kernel-core (LoginResponse.expiresInSeconds)
     */
    private Long expiresInSeconds;
    private String tokenType;
    /** Non-null when kernel requires a follow-up step, e.g. "CONFIRM_MFA" */
    private String nextStep;
    private String mfaToken;
    private Boolean mfaEnabled;
    private String email;
    private String username;
    /** Authorities / roles granted by kernel-core */
    private List<String> authorities;
}
