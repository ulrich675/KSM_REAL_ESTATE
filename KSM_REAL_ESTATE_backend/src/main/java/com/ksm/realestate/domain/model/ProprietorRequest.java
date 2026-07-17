package com.ksm.realestate.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

/**
 * Domain model representing a request to become a proprietor.
 *
 * @author ulrich675
 * @date 2026-07-17
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProprietorRequest {

    private Long id;

    @NotNull
    private Long userId; // the client requesting proprietor status

    @NotNull
    private String phoneNumber;

    @NotNull
    private String physicalAddress;

    @NotNull
    private String motivation;

    @NotNull
    private ProprietorRequestStatus status;

    private Instant createdAt;

    private Instant updatedAt;
}
