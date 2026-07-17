package com.ksm.realestate.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response payload representing a virtual tour image.
 * Excludes internal ID and property ID.
 *
 * @author ulrich675
 * @date 2026-07-17
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VirtualTourImageResponse {
    private String roomLabel;
    private String imageUrl;
    private int displayOrder;
}
