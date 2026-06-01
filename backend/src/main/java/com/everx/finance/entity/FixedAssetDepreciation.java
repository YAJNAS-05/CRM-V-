package com.everx.finance.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.UUID;

@Entity
@Table(name = "fixed_asset_depreciation")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FixedAssetDepreciation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "asset_id", nullable = false)
    private FixedAsset asset;

    @Column(nullable = false)
    private YearMonth depreciationMonth; // e.g., 2026-06

    @Column(nullable = false, precision = 20, scale = 2)
    private BigDecimal depreciationAmount;

    @Column(precision = 20, scale = 2)
    private BigDecimal cumulativeDepreciation;

    @Column(precision = 20, scale = 2)
    private BigDecimal bookValueAfter;

    private UUID journalEntryId; // Reference to GL posting

    @Enumerated(EnumType.STRING)
    private DepreciationStatus status; // CALCULATED, POSTED, REVERSED

    public enum DepreciationStatus {
        CALCULATED,
        POSTED,
        REVERSED
    }
}
