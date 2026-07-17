package com.ksm.realestate.application.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProprietorRequestCreateRequest {
    @NotBlank
    private String phoneNumber;
    @NotBlank
    private String physicalAddress;
    @NotBlank
    private String motivation;
}
