package com.everx.finance.currency.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCurrencyRateRequest {
    private String baseCurrency;
    private String targetCurrency;
    private BigDecimal rate;
}
