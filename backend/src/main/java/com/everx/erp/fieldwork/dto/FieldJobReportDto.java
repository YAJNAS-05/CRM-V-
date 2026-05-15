package com.everx.erp.fieldwork.dto;

import com.everx.erp.fieldwork.ChecklistResult;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class FieldJobReportDto {
    private Long reportId;
    private Long version;
    private UUID fieldJobId;
    private String reportNumber;
    private OffsetDateTime reportGeneratedAt;
    private String reportGeneratedBy;
    private String jobSummary;
    private String workPerformedSummary;
    private String equipmentCondition;
    private String postJobEquipmentStatus;
    private ChecklistResult checklistSummaryResult;
    private String partsUsedSummary;
    private BigDecimal totalJobCostUsd;
    private String issuesFoundDuringJob;
    private String recommendationsToClient;
    private LocalDate nextServiceDueDate;
    private Boolean reportPdfGenerated;
    private Boolean isLocked;
    private Long reversalOfReportId;
    private String reversalReason;
    private OffsetDateTime reversedAt;
    private String reversedBy;
}