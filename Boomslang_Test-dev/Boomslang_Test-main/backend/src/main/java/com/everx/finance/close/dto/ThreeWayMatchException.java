package com.everx.finance.close.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThreeWayMatchException {
    private UUID id;
    private String companyCode;
    private String purchaseOrderNumber;
    private String invoiceNumber;
    private String receivingDocumentNumber;
    private String exceptionType;
    private String description;
    private BigDecimal varianceAmount;
    private String currency;
    private String status; // OPEN, RESOLVED, ESCALATED
    private String priority; // HIGH, MEDIUM, LOW
    private String assignedTo;
    private String resolvedBy;
    private LocalDateTime resolvedAt;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
    private String department;
    private String vendorName;
    private BigDecimal purchaseOrderAmount;
    private BigDecimal invoiceAmount;
    private BigDecimal receivingAmount;
}
