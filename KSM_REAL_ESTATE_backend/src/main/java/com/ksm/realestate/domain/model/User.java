package com.ksm.realestate.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;

/**
 * User domain model representing an application user.
 *
 * @author Antigravity
 * @date 2026-07-08
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @NotNull
    private Long userId;

    @NotNull
    @Email
    @Size(max = 255)
    private String email;

    @NotNull
    private String passwordHash;

    @Size(max = 100)
    private String firstName;

    @Size(max = 100)
    private String lastName;

    @NotNull
    private Role role;

    private String username;

    private String phoneNumber;

    private String businessType;

    private Instant createdAt;

    private Instant updatedAt;
}