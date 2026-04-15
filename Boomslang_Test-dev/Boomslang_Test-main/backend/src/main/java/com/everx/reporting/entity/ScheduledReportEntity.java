package com.everx.reporting.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "scheduled_reports", schema = "everx_reporting")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduledReportEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private Long scheduleId;

    @Column(name = "report_id", nullable = false)
    private Long reportId;

    @Column(name = "schedule_name", nullable = false, length = 100)
    private String scheduleName;

    @Column(name = "cron_expression", nullable = false, length = 50)
    private String cronExpression;

    @Column(name = "frequency", nullable = false, length = 20)
    private String frequency;                       // DAILY / WEEKLY / MONTHLY

    @Column(name = "recipients", nullable = false, columnDefinition = "text[]")
    private String[] recipients;

    @Column(name = "export_format", nullable = false, length = 10)
    private String exportFormat;                    // CSV / EXCEL / PDF

    @Column(name = "filters", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Object filters;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "last_sent_at")
    private LocalDateTime lastSentAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isActive == null) isActive = true;
    }
}
