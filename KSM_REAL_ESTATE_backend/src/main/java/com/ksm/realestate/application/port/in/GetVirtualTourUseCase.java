package com.ksm.realestate.application.port.in;

import com.ksm.realestate.domain.model.VirtualTourImage;
import reactor.core.publisher.Flux;

/**
 * Input port for retrieving virtual tours.
 *
 * @author ulrich675
 * @date 2026-07-17
 */
public interface GetVirtualTourUseCase {

    /**
     * Retrieves the 360 degrees images associated with a property.
     * Throws VirtualTourNotPurchasedException if the requestingUserId hasn't paid
     * for it.
     */
    Flux<VirtualTourImage> getVirtualTour(Long propertyId, Long requestingUserId);
}
