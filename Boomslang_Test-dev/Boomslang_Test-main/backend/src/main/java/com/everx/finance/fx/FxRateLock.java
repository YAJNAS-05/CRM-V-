package com.everx.finance.fx;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Immutable FX rate lock per invoice/transaction.
 * Captures the rate at document creation for later gain/loss reconciliation.
 */
@Entity
@Table(name = "fx_rate_locks", schema = "everx_erp", indexes = {
    @Index(name = "idx_fx_lock_invoice", columnList = "invoice_id"),
    @Index(name = "idx_fx_lock_rate_date", columnList = "rate_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class FxRateLock extends BaseEntity {

    @Column(name = "invoice_id", nullable = false)
    private UUID invoiceId;

    @Column(name = "base_currency", nullable = false, length = 3)
    private String baseCurrency;

    @Column(name = "quote_currency", nullable = false, length = 3)
    private String quoteCurrency;

    @Column(name = "locked_rate", nullable = false, precision = 12, scale = 6)
    private BigDecimal lockedRate;

    @Column(name = "rate_date", nullable = false)
    private LocalDate rateDate;

    @Column(name = "source", length = 50)
    private String source;

    @Column(name = "locked_at", nullable = false)
    private LocalDate lockedAt;

    @Column(name = "is_locked", nullable = false)
    @Builder.Default
    private Boolean isLocked = true;
}
