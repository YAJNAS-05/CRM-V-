package com.everx.finance.currency.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurrencyRateResponse {
    private UUID id;
    private String baseCurrency;
    private String targetCurrency;
    private BigDecimal rate;
    private LocalDateTime fetchedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
