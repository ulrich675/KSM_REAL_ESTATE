package com.ksm.realestate.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Command for registering a user on the external kernel-core auth system.
 *
 * @author Antigravity
 * @date 2026-07-09
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KernelSignUpCommand {
    private String tenantId;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String phoneNumber;
    private String password;
    @Builder.Default
    private String accountType = "BUSINESS";
    private String businessType;
}
