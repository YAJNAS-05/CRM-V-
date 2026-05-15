package com.everx.reporting.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "dashboard_configs", schema = "everx_reporting")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardConfigEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dashboard_id")
    private Long dashboardId;

    @Column(name = "user_email", nullable = false, length = 100)
    private String userEmail;

    @Column(name = "dashboard_name", nullable = false, length = 200)
    private String dashboardName;

    @Column(name = "dashboard_key", length = 100)
    private String dashboardKey;

    @Column(name = "description")
    private String description;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault;

    @Column(name = "is_shared", nullable = false)
    private Boolean isShared;

    @Column(name = "grid_columns", nullable = false)
    private Integer gridColumns;

    @Column(name = "widgets_count", nullable = false)
    private Integer widgetsCount;

    @Column(name = "shared_with_emails")
    private String[] sharedWithEmails;

    @Column(name = "shared_with_roles")
    private String[] sharedWithRoles;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "dashboardConfig", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DashboardWidgetEntity> widgets;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (gridColumns == null) gridColumns = 12;
        if (widgetsCount == null) widgetsCount = 0;
        if (isDefault == null) isDefault = false;
        if (isShared == null) isShared = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
