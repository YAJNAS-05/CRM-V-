package com.everx.erp.fieldwork.dto;

import com.everx.erp.fieldwork.CostCategory;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class FieldJobCostDto {
    private Long costId;
    private Long version;
    private UUID fieldJobId;
    private CostCategory costCategory;
    private String description;
    private String linkedPartId;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal unitCostAmount;
    private String costCurrency;
    private BigDecimal fxRateToUsd;
    private BigDecimal totalCostLocal;
    private BigDecimal totalCostUsd;
    private String receiptReference;
    private byte[] receiptAttached;
    private String glAccount;
    private LocalDate postingDate;
    private Boolean isPaid;
    private LocalDate paidDate;
    private String createdBy;
    private OffsetDateTime createdAt;
    private Long reversalOfCostId;
}