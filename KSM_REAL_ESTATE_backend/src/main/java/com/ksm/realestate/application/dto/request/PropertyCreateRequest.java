package com.ksm.realestate.application.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a new property.
 *
 * @author Antigravity
 * @date 2026-07-08
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PropertyCreateRequest {

    @NotNull
    @Size(max = 255)
    private String title;

    @Size(max = 2000)
    private String description;

    @NotNull
    private BigDecimal priceAmount;

    @NotNull
    @Size(max = 3)
    private String priceCurrency;

    @NotNull
    @Size(max = 255)
    private String streetName;

    @NotNull
    @Size(max = 100)
    private String cityName;

    @NotNull
    @Size(max = 100)
    private String stateName;

    @NotNull
    @Size(max = 20)
    private String zipCode;

    @NotNull
    @Size(max = 100)
    private String country;

    @NotNull
    private String locationWkt;

    @NotNull
    @Size(max = 100)
    private String category;

    @NotNull
    private Long ownerId;
}
