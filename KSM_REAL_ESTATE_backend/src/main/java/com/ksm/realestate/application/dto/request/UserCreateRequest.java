package com.ksm.realestate.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for user registration request.
 *
 * @author Antigravity
 * @date 2026-07-09
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserCreateRequest {

    @Email
    @NotNull
    @Size(max = 255)
    private String email;

    @NotNull
    @Size(min = 10, max = 255)
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{10,}$", message = "Password must be at least 10 characters long, and include uppercase, lowercase, number, and special character (@$!%*?&)")
    private String password;

    @NotNull
    @Size(max = 100)
    private String firstName;

    @NotNull
    @Size(max = 100)
    private String lastName;

    @NotNull
    @Size(min = 3, max = 50)
    private String username;

    @NotNull
    @Size(max = 20)
    private String phoneNumber;

    @NotNull
    @Size(max = 50)
    private String businessType;
}
