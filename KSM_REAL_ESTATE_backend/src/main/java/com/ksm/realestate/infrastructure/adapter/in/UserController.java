/**
 * REST controller for user profile management endpoints.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
package com.ksm.realestate.infrastructure.adapter.in;

import com.ksm.realestate.application.dto.response.UserResponse;
import com.ksm.realestate.application.service.UserService;
import com.ksm.realestate.domain.model.Role;
import com.ksm.realestate.infrastructure.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.time.Instant;

/**
 * UserController exposes the /api/users/** endpoints.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

        private final UserService userService;
        private final UserMapper userMapper;

        /**
         * List users, optionally filtered by role.
         * Example: GET /api/users?role=PROPRIETOR
         *
         * @author ulrich675
         */
        @GetMapping
        public Flux<ApiResponse<UserResponse>> getUsersByRole(
                        @RequestParam(required = false) String role) {
                Role targetRole = (role != null && !role.isBlank())
                                ? Role.valueOf(role.toUpperCase())
                                : null;
                Flux<com.ksm.realestate.domain.model.User> users = (targetRole != null)
                                ? userService.getUsersByRole(targetRole)
                                : userService.getAllUsers();
                return users
                                .map(userMapper::toResponse)
                                .map(resp -> ApiResponse.<UserResponse>builder()
                                                .status("SUCCESS")
                                                .message("Users retrieved")
                                                .data(resp)
                                                .timestamp(Instant.now())
                                                .errors(null)
                                                .build());
        }

        /**
         * Retrieve a user profile by their identifier.
         *
         * @param id the user identifier
         * @return the user profile
         */
        @GetMapping("/{id}")
        public Mono<ApiResponse<UserResponse>> getUser(@PathVariable("id") Long id) {
                return userService.getUserById(id)
                                .map(userMapper::toResponse)
                                .map(resp -> ApiResponse.<UserResponse>builder()
                                                .status("SUCCESS")
                                                .message("User retrieved")
                                                .data(resp)
                                                .timestamp(Instant.now())
                                                .errors(null)
                                                .build());
        }

        /**
         * Toggle active/inactive status for a user account.
         *
         * @author ulrich675
         */
        @PatchMapping("/{id}/toggle-active")
        public Mono<ApiResponse<UserResponse>> toggleActive(@PathVariable("id") Long id) {
                return userService.toggleUserActive(id)
                                .map(userMapper::toResponse)
                                .map(resp -> ApiResponse.<UserResponse>builder()
                                                .status("SUCCESS")
                                                .message("Account status toggled")
                                                .data(resp)
                                                .timestamp(Instant.now())
                                                .errors(null)
                                                .build());
        }

        /**
         * Request a role upgrade to PROPRIETOR.
         *
         * @param id the user identifier
         * @return the updated user profile
         */
        @PostMapping("/{id}/request-proprietor")
        public Mono<ApiResponse<UserResponse>> requestProprietor(@PathVariable("id") Long id) {
                return userService.requestProprietorRole(id)
                                .map(userMapper::toResponse)
                                .map(resp -> ApiResponse.<UserResponse>builder()
                                                .status("SUCCESS")
                                                .message("Proprietor role requested")
                                                .data(resp)
                                                .timestamp(Instant.now())
                                                .errors(null)
                                                .build());
        }

        /**
         * Approve or reject a proprietor request (admin only).
         *
         * @param id       the user identifier
         * @param approved true to approve, false to reject
         * @return the updated user profile
         */
        @PostMapping("/{id}/handle-proprietor-request")
        public Mono<ApiResponse<UserResponse>> handleProprietorRequest(@PathVariable("id") Long id,
                        @RequestParam boolean approved) {
                return userService.handleProprietorRequest(id, approved)
                                .map(userMapper::toResponse)
                                .map(resp -> ApiResponse.<UserResponse>builder()
                                                .status("SUCCESS")
                                                .message("Request handled")
                                                .data(resp)
                                                .timestamp(Instant.now())
                                                .errors(null)
                                                .build());
        }
}
