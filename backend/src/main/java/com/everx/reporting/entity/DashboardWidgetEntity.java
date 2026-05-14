package com.everx.reporting.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "dashboard_widgets", schema = "everx_reporting")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardWidgetEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "widget_id")
    private Long widgetId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dashboard_id", nullable = false)
    @JsonIgnore
    private DashboardConfigEntity dashboardConfig;

    @Column(name = "report_id")
    private Long reportId;

    @Column(name = "widget_type", nullable = false, length = 50)
    private String widgetType;

    @Column(name = "widget_title", nullable = false, length = 200)
    private String widgetTitle;

    @Column(name = "widget_key", length = 100)
    private String widgetKey;

    @Column(name = "description")
    private String description;

    @Column(name = "col_index", nullable = false)
    private Integer colIndex;

    @Column(name = "row_index", nullable = false)
    private Integer rowIndex;

    @Column(name = "col_span", nullable = false)
    private Integer colSpan;

    @Column(name = "row_span", nullable = false)
    private Integer rowSpan;

    @Column(name = "background_color")
    private String backgroundColor;

    @Column(name = "font_size")
    private String fontSize;

    @Column(name = "config", columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private Object config;

    @Column(name = "chart_type")
    private String chartType;

    @Column(name = "metric_field")
    private String metricField;

    @Column(name = "metric_label")
    private String metricLabel;

    @Column(name = "metric_format")
    private String metricFormat;

    @Column(name = "filters_applied", columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private Object filtersApplied;

    @Column(name = "sort_config", columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private Object sortConfig;

    @Column(name = "refresh_interval")
    private Integer refreshInterval;

    @Column(name = "cache_duration")
    private Integer cacheDuration;

    @Column(name = "is_cached", nullable = false)
    private Boolean isCached;

    @Column(name = "last_refreshed_at")
    private LocalDateTime lastRefreshedAt;

    @Column(name = "is_visible", nullable = false)
    private Boolean isVisible;

    @Column(name = "is_locked", nullable = false)
    private Boolean isLocked;

    @Column(name = "widget_order", nullable = false)
    private Integer widgetOrder;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (colSpan == null) colSpan = 3;
        if (rowSpan == null) rowSpan = 2;
        if (colIndex == null) colIndex = 0;
        if (rowIndex == null) rowIndex = 0;
        if (isVisible == null) isVisible = true;
        if (isLocked == null) isLocked = false;
        if (isCached == null) isCached = false;
        if (refreshInterval == null) refreshInterval = 300;
        if (widgetOrder == null) widgetOrder = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
