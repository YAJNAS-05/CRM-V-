package com.everx.finance.fx;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request DTO for calculating FX gain/loss between two dates.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalculateFxGainLossRequest {
    private BigDecimal amount;         // Transaction amount in fromCurrency
    private String fromCurrency;       // Original currency
    private String toCurrency;         // Target currency
    private LocalDate asOf;            // Historical date to get rate as of
}
