package com.everx.finance.fx;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Response DTO for FX rate history.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FxRateResponse {
    private UUID id;
    private String fromCurrency;
    private String toCurrency;
    private BigDecimal exchangeRate;
    private LocalDate rateDate;
    private String source;
    private String notes;
}
