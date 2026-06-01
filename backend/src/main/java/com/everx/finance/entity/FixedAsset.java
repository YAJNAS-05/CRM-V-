package com.everx.finance.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "fixed_assets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FixedAsset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String assetCode;

    @Column(nullable = false)
    private String assetName;

    @Column(length = 1000)
    private String description;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private AssetCategory category;

    @Column(nullable = false)
    private LocalDate acquisitionDate;

    @Column(nullable = false, precision = 20, scale = 2)
    private BigDecimal acquisitionCost;

    @Column(precision = 20, scale = 2)
    private BigDecimal salvageValue;

    @Column(nullable = false)
    private Integer usefulLifeYears;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DepreciationMethod depreciationMethod; // STRAIGHT_LINE, DECLINING_BALANCE, SUM_OF_YEARS

    @Column(precision = 20, scale = 2)
    private BigDecimal accumulatedDepreciation;

    @Column(precision = 20, scale = 2)
    private BigDecimal bookValue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetStatus status; // ACTIVE, DISPOSED, RETIRED

    private LocalDate disposalDate;

    @Column(precision = 20, scale = 2)
    private BigDecimal disposalProceeds;

    @Column(precision = 20, scale = 2)
    private BigDecimal gainLossOnDisposal;

    @Column(nullable = false)
    private LocalDate createdDate;

    @Column(nullable = false)
    private String createdBy;

    @Column(nullable = false)
    private LocalDate updatedDate;

    @Column(nullable = false)
    private String updatedBy;

    @Version
    private Long version;

    public enum DepreciationMethod {
        STRAIGHT_LINE,
        DECLINING_BALANCE,
        SUM_OF_YEARS_DIGITS
    }

    public enum AssetStatus {
        ACTIVE,
        DISPOSED,
        RETIRED
    }
}
