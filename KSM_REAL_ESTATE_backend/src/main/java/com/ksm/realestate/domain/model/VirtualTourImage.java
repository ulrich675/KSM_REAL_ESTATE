package com.ksm.realestate.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Domain model for a 360 virtual tour image.
 *
 * @author ulrich675
 * @date 2026-07-17
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VirtualTourImage {
    private Long id;
    private Long propertyId;
    private String roomLabel;
    private String imageUrl;
    private int displayOrder;
}
