package com.ksm.realestate.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;

/**
 * Property domain model representing a real estate listing.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Property {

    @NotNull
    private Long propertyId;

    @NotNull
    @Size(max = 255)
    private String title;

    @Size(max = 2000)
    private String description;

    @NotNull
    private Price price;

    @NotNull
    private Address address;

    // Geometry point as WKT string for simplicity
    @NotNull
    private String locationWkt;

    @NotNull
    private String category;

    @NotNull
    private Long ownerId;

    private String imageMain;
    private String imagesPiecesJson;
    private Integer superficie;
    private Integer chambres;
    private Integer sallesDeBain;

    private Instant createdAt;
    private Instant updatedAt;
}
