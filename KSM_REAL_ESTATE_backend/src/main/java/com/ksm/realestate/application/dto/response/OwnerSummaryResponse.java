package com.ksm.realestate.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for proprietor summary data exposed on property details.
 *
 * @author ulrich675
 * @date 2026-07-17
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OwnerSummaryResponse {
    private Long id;
    private String nom;
    private String numero;
    private String email;
    private Double note;
}
