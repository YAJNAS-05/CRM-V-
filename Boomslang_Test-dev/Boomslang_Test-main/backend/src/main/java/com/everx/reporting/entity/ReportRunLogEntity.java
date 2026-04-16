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
@Table(name = "report_run_log", schema = "everx_reporting")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportRunLogEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "run_id")
    private Long runId;

    @Column(name = "report_id", nullable = false)
    private Long reportId;

    @Column(name = "run_by", length = 100)
    private String runBy;

    @Column(name = "run_at", nullable = false)
    private LocalDateTime runAt;

    @Column(name = "filters_applied", columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private Object filtersApplied;

    @Column(name = "row_count")
    private Integer rowCount;

    @Column(name = "duration_ms")
    private Integer durationMs;

    @Column(name = "export_format", length = 10)
    private String exportFormat;

    @Column(name = "status", nullable = false, length = 10)
    private String status;                          // SUCCESS / FAILED / TIMEOUT

    @PrePersist
    protected void onCreate() {
        runAt = LocalDateTime.now();
        if (status == null) status = "SUCCESS";
    }
}
