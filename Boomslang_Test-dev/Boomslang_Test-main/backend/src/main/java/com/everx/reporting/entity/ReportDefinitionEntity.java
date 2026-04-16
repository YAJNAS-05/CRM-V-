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
@Table(name = "report_definitions", schema = "everx_reporting")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportDefinitionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    @Column(name = "report_name", nullable = false, length = 200)
    private String reportName;

    @Column(name = "report_key", unique = true, length = 100)
    private String reportKey;

    @Column(name = "report_type", nullable = false, length = 20)
    private String reportType;                      // STANDARD / CUSTOM / SHARED

    @Column(name = "module", nullable = false, length = 50)
    private String module;

    @Column(name = "description")
    private String description;

    @Column(name = "definition", nullable = false, columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private Object definition;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "owned_by", length = 100)
    private String ownedBy;

    @Column(name = "is_system", nullable = false)
    private Boolean isSystem;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "last_run_at")
    private LocalDateTime lastRunAt;

    @Column(name = "run_count", nullable = false)
    private Integer runCount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (runCount == null) runCount = 0;
        if (isActive == null) isActive = true;
        if (isSystem == null) isSystem = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
