package com.everx.finance.fx;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request DTO for recording FX exchange rates.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecordFxRateRequest {
    private String fromCurrency;      // USD, AUD, JPY, etc.
    private String toCurrency;        // USD, AUD, JPY, etc.
    private BigDecimal exchangeRate;   // 1 unit of fromCurrency = X units of toCurrency
    private LocalDate rateDate;        // Date rate became effective
    private String source;             // ECB, ECN, MANUAL, etc.
    private String notes;              // Optional notes
}
