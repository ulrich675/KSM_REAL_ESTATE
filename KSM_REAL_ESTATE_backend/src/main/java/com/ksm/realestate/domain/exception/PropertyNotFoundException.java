package com.ksm.realestate.domain.exception;

/**
 * Exception thrown when a property is not found.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
public class PropertyNotFoundException extends BusinessException {
    public PropertyNotFoundException(Long propertyId) {
        super("PROPERTY_NOT_FOUND", "Property with ID " + propertyId + " not found.");
    }
}
