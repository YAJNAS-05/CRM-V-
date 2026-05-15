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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "field_job_reports", schema = "everx_erp")
@Getter
@Setter
public class FieldJobReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    @Version
    @Column(name = "version", nullable = false)
    private Long version = 0L;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "field_job_id", nullable = false, unique = true)
    private FieldJob fieldJob;

    @Column(name = "report_number", nullable = false, unique = true)
    private String reportNumber;

    @Column(name = "report_generated_at", nullable = false)
    private OffsetDateTime reportGeneratedAt;

    @Column(name = "report_generated_by")
    private String reportGeneratedBy;

    @Column(name = "job_summary", nullable = false)
    private String jobSummary;

    @Column(name = "work_performed_summary", nullable = false)
    private String workPerformedSummary;

    @Column(name = "equipment_condition")
    private String equipmentCondition;

    @Column(name = "post_job_equipment_status")
    private String postJobEquipmentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "checklist_summary_result")
    private ChecklistResult checklistSummaryResult;

    @Column(name = "parts_used_summary")
    private String partsUsedSummary;

    @Column(name = "total_job_cost_usd", precision = 12, scale = 2)
    private BigDecimal totalJobCostUsd;

    @Column(name = "issues_found_during_job")
    private String issuesFoundDuringJob;

    @Column(name = "recommendations_to_client")
    private String recommendationsToClient;

    @Column(name = "next_service_due_date")
    private LocalDate nextServiceDueDate;

    @Column(name = "report_pdf_generated", nullable = false)
    private Boolean reportPdfGenerated = false;

    @Column(name = "report_pdf_document")
    private byte[] reportPdfDocument;

    @Column(name = "is_locked", nullable = false)
    private Boolean isLocked = false;

    @Column(name = "reversal_of_report_id")
    private Long reversalOfReportId;

    @Column(name = "reversal_reason")
    private String reversalReason;

    @Column(name = "reversed_at")
    private OffsetDateTime reversedAt;

    @Column(name = "reversed_by")
    private String reversedBy;
}