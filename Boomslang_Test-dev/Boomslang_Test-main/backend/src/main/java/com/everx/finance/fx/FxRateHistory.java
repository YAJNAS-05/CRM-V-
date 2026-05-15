package com.everx.finance.fx;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Tracks FX exchange rates for reversal and FX gain/loss calculation.
 * Used to recalculate FX gains when exchange rates change.
 */
@Entity
@Table(name = "fx_rate_history", schema = "everx_erp", indexes = {
    @Index(name = "idx_fx_from_to_date", columnList = "from_currency, to_currency, rate_date"),
    @Index(name = "idx_fx_rate_date", columnList = "rate_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class FxRateHistory extends BaseEntity {

    @Column(name = "from_currency", nullable = false, length = 3)
    private String fromCurrency;  // USD, AUD, JPY

    @Column(name = "to_currency", nullable = false, length = 3)
    private String toCurrency;    // USD, AUD, JPY

    @Column(name = "exchange_rate", nullable = false)
    private BigDecimal exchangeRate;  // 1 USD = X AUD

    @Column(name = "rate_date", nullable = false)
    private LocalDate rateDate;   // Date rate was effective

    @Column(name = "source", nullable = false, length = 50)
    private String source;  // ECB, ECN, MANUAL, etc.

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
