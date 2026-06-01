package com.everx.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancialRatiosDto {
    private LocalDate asOfDate;
    
    // Liquidity Ratios
    private BigDecimal currentRatio; // Current Assets / Current Liabilities
    private BigDecimal quickRatio; // (Current Assets - Inventory) / Current Liabilities
    private BigDecimal workingCapital; // Current Assets - Current Liabilities
    
    // Profitability Ratios
    private BigDecimal netProfitMargin; // Net Income / Revenue (%)
    private BigDecimal grossProfit; // Revenue - COGS
    private BigDecimal grossProfitMargin; // Gross Profit / Revenue (%)
    private BigDecimal returnOnAssets; // Net Income / Total Assets (%)
    private BigDecimal returnOnEquity; // Net Income / Equity (%)
    
    // Efficiency Ratios
    private BigDecimal receivablesTurnover; // Revenue / Accounts Receivable
    private BigDecimal daysReceivablesOutstanding; // 365 / Receivables Turnover
    private BigDecimal payablesTurnover; // COGS / Accounts Payable
    private BigDecimal daysPayablesOutstanding; // 365 / Payables Turnover
    
    // Leverage Ratios
    private BigDecimal debtToEquityRatio; // Total Liabilities / Equity
    private BigDecimal debtToAssetsRatio; // Total Liabilities / Total Assets
    private BigDecimal equityRatio; // Equity / Total Assets (%)
}
