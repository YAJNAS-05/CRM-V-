package com.everx.finance.reversal;

/**
 * Enumeration of valid reasons for reversing accounting documents.
 * Used to classify reversals for audit and compliance tracking.
 */
public enum ReversalReasonCode {
    WRONG_AMOUNT("Wrong invoice amount"),
    WRONG_CUSTOMER("Wrong customer or entity"),
    WRONG_CURRENCY("Wrong currency recorded"),
    DUPLICATE_INVOICE("Duplicate invoice"),
    ORDER_CANCELLED("Original order cancelled"),
    CREDIT_NOTE("Credit note requested"),
    OTHER("Other reason");

    private final String description;

    ReversalReasonCode(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
