package com.everx.finance.fx;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Immutable FX rate snapshot locked at transaction time
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
public class FxRateSnapshot {
    private UUID transactionId;
    private String baseCurrency;
    private String quoteCurrency;
    private BigDecimal lockedRate;
    private LocalDate rateDate;
    private String source;
    private LocalDate lockedAt;
    private Boolean isLocked;
}
