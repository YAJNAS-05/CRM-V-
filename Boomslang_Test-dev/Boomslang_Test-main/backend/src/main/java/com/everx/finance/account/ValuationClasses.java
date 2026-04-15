package com.everx.finance.account;

/**
 * Valuation class constants for GL account determination.
 * Different GL accounts for different product/transaction types.
 */
public final class ValuationClasses {
    public static final String EQUIP = "EQUIP";      // Equipment/machinery
    public static final String PARTS = "PARTS";      // Spare parts
    public static final String SERVICE = "SERVICE";  // Service/labor
    public static final String TRADE = "TRADE";      // Trade receivable/payable
    public static final String FX = "FX";            // Foreign exchange
    public static final String GST_OUT = "GST_OUT";  // GST collected (Australia)
    public static final String GST_IN = "GST_IN";    // GST paid (input tax credit)

    private ValuationClasses() {}
}
