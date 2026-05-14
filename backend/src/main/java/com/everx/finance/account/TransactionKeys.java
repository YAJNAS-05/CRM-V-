package com.everx.finance.account;

/**
 * Transaction key constants for GL account determination.
 * Maps business transaction types to configuration keys.
 */
public final class TransactionKeys {
    public static final String BSX = "BSX";  // Inventory posting / stock receipt
    public static final String GBB = "GBB";  // Goods issue / COGS
    public static final String PRD = "PRD";  // Price difference / PPV variance
    public static final String WRX = "WRX";  // GR/IR clearing
    public static final String ARC = "ARC";  // Accounts receivable
    public static final String REV = "REV";  // Revenue
    public static final String TAX = "TAX";  // Tax (GST/VAT)
    public static final String APL = "APL";  // Accounts payable
    public static final String FXG = "FXG";  // FX gain
    public static final String FXL = "FXL";  // FX loss
    public static final String FRE = "FRE";  // Freight / shipping cost

    private TransactionKeys() {}
}
