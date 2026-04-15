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
@Table(name = "report_filter_presets", schema = "everx_reporting")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FilterPresetEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "preset_id")
    private Long presetId;

    @Column(name = "report_id", nullable = false)
    private Long reportId;

    @Column(name = "user_email", nullable = false, length = 100)
    private String userEmail;

    @Column(name = "preset_name", nullable = false, length = 100)
    private String presetName;

    @Column(name = "filters", nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Object filters;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isDefault == null) isDefault = false;
    }
}

@Entity
@Table(name = "report_shares", schema = "everx_reporting")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class ReportShareEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "share_id")
    private Long shareId;

    @Column(name = "report_id", nullable = false)
    private Long reportId;

    @Column(name = "shared_with_email", length = 100)
    private String sharedWithEmail;

    @Column(name = "shared_with_role", length = 50)
    private String sharedWithRole;

    @Column(name = "can_edit", nullable = false)
    private Boolean canEdit;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (canEdit == null) canEdit = false;
    }
}
