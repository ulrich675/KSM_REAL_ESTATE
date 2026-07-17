package com.ksm.realestate.domain.exception;

/**
 * Exception thrown when a user attempts to access a virtual tour
 * without having completed the payment for it.
 *
 * @author ulrich675
 * @date 2026-07-17
 */
public class VirtualTourNotPurchasedException extends BusinessException {

    public VirtualTourNotPurchasedException(String propertyId, String userId) {
        super("VIRTUAL_TOUR_NOT_PURCHASED", "L'utilisateur " + userId
                + " n'a pas acheté l'accès à la visite virtuelle du bien " + propertyId + ".");
    }
}
