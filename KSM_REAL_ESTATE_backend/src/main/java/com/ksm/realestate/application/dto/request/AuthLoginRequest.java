/**
 * DTO for user login request.
 *
 * @author Antigravity
 * @date 2026-07-08
 */
package com.ksm.realestate.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthLoginRequest {

    @Email
    @NotNull
    @Size(max = 255)
    private String email;

    @NotNull
    @Size(min = 8, max = 255)
    private String password;
}
