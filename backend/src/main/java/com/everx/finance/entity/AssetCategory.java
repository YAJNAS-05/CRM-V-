package com.everx.finance.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "asset_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String categoryCode;

    @Column(nullable = false)
    private String categoryName;

    @Column(length = 1000)
    private String description;

    // GL accounts for depreciation
    private String assetGlAccount;      // e.g., 1500 - Fixed Assets
    private String depreciationGlAccount; // e.g., 1510 - Accumulated Depreciation
    private String expenseGlAccount;      // e.g., 6200 - Depreciation Expense

    @Column(nullable = false)
    private LocalDate createdDate;

    @Column(nullable = false)
    private String createdBy;

    @Version
    private Long version;
}
