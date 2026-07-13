package com.ksm.realestate.application.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for property response data.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PropertyResponse {

    private Long propertyId;
    private String title;
    private String description;
    private BigDecimal priceAmount;
    private String priceCurrency;
    private String streetName;
    private String cityName;
    private String stateName;
    private String zipCode;
    private String country;
    private String locationWkt;
    private String category;
    private Long ownerId;

    private String imageMain;
    private String imagesPiecesJson;
    private Integer superficie;
    private Integer chambres;
    private Integer sallesDeBain;

    private Double latitude;
    private Double longitude;
    private String status;

    private Instant createdAt;
    private Instant updatedAt;
}
