package com.everx.finance.entity;

import com.everx.finance.account.entity.GlAccount;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "gl_revaluations", schema = "everx_finance")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GlRevaluation extends AuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    private GlAccount account;

    @Column(name = "revaluation_date", nullable = false)
    private LocalDate revaluationDate;

    @Column(name = "original_currency", nullable = false, length = 3)
    private String originalCurrency;

    @Column(name = "reporting_currency", nullable = false, length = 3)
    private String reportingCurrency;

    @Column(name = "original_balance", nullable = false, precision = 20, scale = 2)
    private BigDecimal originalBalance;

    @Column(name = "revalued_balance", nullable = false, precision = 20, scale = 2)
    private BigDecimal revaluedBalance;

    @Column(name = "revaluation_gain_loss", nullable = false, precision = 20, scale = 2)
    private BigDecimal revaluationGainLoss;

    @Column(name = "exchange_rate", nullable = false, precision = 20, scale = 6)
    private BigDecimal exchangeRate;

    @Column(name = "journal_entry_id")
    private UUID journalEntryId; // Reference to GL entry for gain/loss

    @Version
    private Long version;

    @Override
    public String toString() {
        return "GlRevaluation{" +
                "id=" + id +
                ", account=" + account.getAccountCode() +
                ", revaluationDate=" + revaluationDate +
                ", originalCurrency='" + originalCurrency + '\'' +
                ", reportingCurrency='" + reportingCurrency + '\'' +
                ", revaluationGainLoss=" + revaluationGainLoss +
                '}';
    }
}
