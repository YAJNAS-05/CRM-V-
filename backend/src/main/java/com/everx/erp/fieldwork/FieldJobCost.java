package com.everx.erp.fieldwork;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "field_job_costs", schema = "everx_erp")
@Getter
@Setter
public class FieldJobCost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cost_id")
    private Long costId;

    @Version
    @Column(name = "version", nullable = false)
    private Long version = 0L;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "field_job_id", nullable = false)
    private FieldJob fieldJob;

    @Enumerated(EnumType.STRING)
    @Column(name = "cost_category", nullable = false)
    private CostCategory costCategory;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "linked_part_id")
    private String linkedPartId;

    @Column(name = "quantity", nullable = false, precision = 12, scale = 2)
    private BigDecimal quantity;

    @Column(name = "unit")
    private String unit;

    @Column(name = "unit_cost_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitCostAmount;

    @Column(name = "cost_currency", length = 10)
    private String costCurrency;

    @Column(name = "fx_rate_to_usd", precision = 10, scale = 6)
    private BigDecimal fxRateToUsd;

    @Column(name = "total_cost_local", precision = 12, scale = 2)
    private BigDecimal totalCostLocal;

    @Column(name = "total_cost_usd", precision = 12, scale = 2)
    private BigDecimal totalCostUsd;

    @Column(name = "receipt_reference")
    private String receiptReference;

    @Column(name = "receipt_attached")
    private byte[] receiptAttached;

    @Column(name = "gl_account")
    private String glAccount;

    @Column(name = "posting_date", nullable = false)
    private LocalDate postingDate;

    @Column(name = "is_paid", nullable = false)
    private Boolean isPaid = false;

    @Column(name = "paid_date")
    private LocalDate paidDate;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "reversal_of_cost_id")
    private Long reversalOfCostId;
}