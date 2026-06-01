package com.everx.finance.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tax_configurations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxConfiguration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String taxCode; // e.g., "VAT", "GST", "INCOME_TAX"

    @Column(nullable = false)
    private String taxName;

    @Column(nullable = false)
    private String jurisdiction; // e.g., "US", "UK", "CA"

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal taxRate; // e.g., 10.00 for 10%

    @Enumerated(EnumType.STRING)
    private TaxType taxType; // DIRECT, INDIRECT, PAYROLL

    @Column(nullable = false)
    private LocalDate effectiveDate;

    private LocalDate expiryDate;

    @Column(length = 1000)
    private String description;

    private String applicableToAccountCode; // e.g., "2200" for VAT payable

    @Enumerated(EnumType.STRING)
    private TaxStatus status; // ACTIVE, INACTIVE, ARCHIVED

    @Column(nullable = false)
    private LocalDate createdDate;

    @Column(nullable = false)
    private String createdBy;

    @Version
    private Long version;

    public enum TaxType {
        DIRECT,      // Income tax
        INDIRECT,    // Sales tax, VAT
        PAYROLL      // Employee withholding
    }

    public enum TaxStatus {
        ACTIVE,
        INACTIVE,
        ARCHIVED
    }
}
