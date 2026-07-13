package com.ksm.realestate.domain.spec;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Specification encapsulating search and filter criteria for properties.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PropertySpecification {
    private String category;
    private String city;
    private Double minPrice;
    private Double maxPrice;
}
