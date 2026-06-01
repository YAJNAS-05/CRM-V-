package com.everx.finance.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "tax_calculations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxCalculation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tax_config_id", nullable = false)
    private TaxConfiguration taxConfig;

    @Column(nullable = false)
    private LocalDate taxPeriodStart;

    @Column(nullable = false)
    private LocalDate taxPeriodEnd;

    @Column(nullable = false, precision = 20, scale = 2)
    private BigDecimal taxableBase; // Basis for tax calculation

    @Column(nullable = false, precision = 20, scale = 2)
    private BigDecimal taxAmount; // Calculated tax amount

    @Column(precision = 20, scale = 2)
    private BigDecimal adjustments; // Credits, deductions

    @Column(precision = 20, scale = 2)
    private BigDecimal payableAmount; // Final tax payable

    @Enumerated(EnumType.STRING)
    private TaxCalculationStatus status; // CALCULATED, FILED, PAID

    private UUID journalEntryId; // Reference to GL posting

    @Column(nullable = false)
    private LocalDate createdDate;

    @Column(nullable = false)
    private String createdBy;

    public enum TaxCalculationStatus {
        CALCULATED,
        FILED,
        PAID
    }
}
