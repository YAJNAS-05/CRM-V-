package com.everx.erp.equipment;

/**
 * Physical status of equipment - tracks the current physical state of the asset
 * Separate from CommercialStatus which tracks the commercial lifecycle
 */
public enum PhysicalStatus {
    AVAILABLE,              // In warehouse, ready for deployment
    RESERVED,              // Assigned to a customer but not yet shipped
    IN_TRANSIT,            // Being shipped to customer site
    INSTALLED,             // Deployed at customer site and operational
    IN_MAINTENANCE,        // Undergoing maintenance or repair
    SCRAPPED,              // End of life, no longer usable
    ON_CONSIGNMENT,        // Placed at customer site but not yet sold
    IN_REFURBISHMENT       // Being refurbished after PO receipt
}
