package com.everx.erp.equipment;

/**
 * Commercial status of equipment - tracks the sales/revenue lifecycle
 * Separate from PhysicalStatus which tracks the physical state
 */
public enum CommercialStatus {
    LEAD,                  // Equipment identified as potential sale
    QUOTED,                // Quote provided to customer
    NEGOTIATING,           // In price/terms negotiation
    SOLD,                  // Sale completed, ownership transferred
    WARRANTY_ACTIVE,       // Under warranty coverage
    WARRANTY_EXPIRED,      // Warranty has expired but equipment may still be in service
    LEASED,                // Being leased to customer
    RENTED,                // Being rented to customer (short-term)
    DISPOSED               // Off books, sold for scrap/donation
}
