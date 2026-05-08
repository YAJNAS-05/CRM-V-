package com.everx.customersuccess.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "simplified_dashboards")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimplifiedDashboard {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "dashboard_name", nullable = false)
    private String dashboardName;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "dashboard_type", nullable = false)
    private DashboardType dashboardType;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_audience")
    private TargetAudience targetAudience;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault;

    @Column(name = "layout_type")
    private String layoutType;

    @Column(name = "refresh_interval_minutes")
    private Integer refreshIntervalMinutes;

    @Column(name = "auto_refresh", nullable = false)
    private Boolean autoRefresh;

    @Column(name = "view_count")
    private Long viewCount;

    @Column(name = "last_viewed_at")
    private LocalDateTime lastViewedAt;

    @Column(name = "favorite_count")
    private Long favoriteCount;

    @Column(name = "rating")
    private Double rating;

    @Column(name = "number_of_ratings")
    private Integer numberOfRatings;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "widgets")
    private List<Widget> widgets;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "filters")
    private List<DashboardFilter> filters;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "layout")
    private Map<String, Object> layout;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "data_sources")
    private List<DataSource> dataSources;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "permissions")
    private List<DashboardPermission> permissions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "export_options")
    private List<ExportOption> exportOptions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "subscription_settings")
    private SubscriptionSettings subscriptionSettings;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "published_by")
    private String publishedBy;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    private Map<String, Object> metadata;

    @Column(name = "tags")
    private List<String> tags;

    @Column(name = "industry")
    private String industry;

    @Column(name = "language")
    private String language;

    // Helper methods
    public boolean isPublished() {
        return publishedAt != null;
    }

    public boolean canBeViewed() {
        return isActive != null && isActive && isPublished();
    }

    public boolean isPopular() {
        return viewCount != null && viewCount > 1000;
    }

    public boolean isHighlyRated() {
        return rating != null && rating >= 4.5 && numberOfRatings != null && numberOfRatings >= 10;
    }

    public boolean isExecutiveDashboard() {
        return TargetAudience.EXECUTIVE.equals(targetAudience);
    }

    public boolean isOperationalDashboard() {
        return TargetAudience.OPERATIONAL.equals(targetAudience);
    }

    public void incrementViewCount() {
        this.viewCount = (this.viewCount == null ? 0L : this.viewCount) + 1;
        this.lastViewedAt = LocalDateTime.now();
    }

    public void updateRating(Integer newRating) {
        if (this.rating == null || this.numberOfRatings == null) {
            this.rating = newRating.doubleValue();
            this.numberOfRatings = 1;
        } else {
            double totalRating = this.rating * this.numberOfRatings + newRating;
            this.numberOfRatings++;
            this.rating = totalRating / this.numberOfRatings;
        }
    }

    public void publish(String publishedBy) {
        this.publishedAt = LocalDateTime.now();
        this.publishedBy = publishedBy;
        this.isActive = true;
    }

    public void unpublish() {
        this.publishedAt = null;
        this.publishedBy = null;
        this.isActive = false;
    }

    public void addWidget(Widget widget) {
        if (this.widgets == null) {
            this.widgets = new java.util.ArrayList<>();
        }
        this.widgets.add(widget);
    }

    public void removeWidget(String widgetId) {
        if (this.widgets != null) {
            this.widgets.removeIf(widget -> widget.getId().equals(widgetId));
        }
    }

    public void addFilter(DashboardFilter filter) {
        if (this.filters == null) {
            this.filters = new java.util.ArrayList<>();
        }
        this.filters.add(filter);
    }

    public void addDataSource(DataSource dataSource) {
        if (this.dataSources == null) {
            this.dataSources = new java.util.ArrayList<>();
        }
        this.dataSources.add(dataSource);
    }

    public void addPermission(DashboardPermission permission) {
        if (this.permissions == null) {
            this.permissions = new java.util.ArrayList<>();
        }
        this.permissions.add(permission);
    }

    public void addExportOption(ExportOption exportOption) {
        if (this.exportOptions == null) {
            this.exportOptions = new java.util.ArrayList<>();
        }
        this.exportOptions.add(exportOption);
    }

    public long getVisibleWidgetsCount() {
        if (widgets == null) return 0;
        return widgets.stream()
                .filter(widget -> widget.isVisible())
                .count();
    }

    public long getTotalWidgetsCount() {
        return widgets == null ? 0 : widgets.size();
    }

    public long getActiveDataSourcesCount() {
        if (dataSources == null) return 0;
        return dataSources.stream()
                .filter(DataSource::isActive)
                .count();
    }

    public boolean hasRealTimeData() {
        if (dataSources == null) return false;
        return dataSources.stream()
                .anyMatch(dataSource -> Boolean.TRUE.equals(dataSource.getRealTime()));
    }

    public boolean hasSubscriptions() {
        return subscriptionSettings != null && 
               subscriptionSettings.getEnabled() != null && 
               subscriptionSettings.getEnabled();
    }

    public Widget getWidgetById(String widgetId) {
        if (widgets == null) return null;
        return widgets.stream()
                .filter(widget -> widget.getId().equals(widgetId))
                .findFirst()
                .orElse(null);
    }

    public enum DashboardType {
        EXECUTIVE_OVERVIEW,
        OPERATIONAL_METRICS,
        CUSTOMER_SUCCESS,
        FINANCIAL_PERFORMANCE,
        SALES_ANALYTICS,
        MARKETING_INSIGHTS,
        HR_DASHBOARD,
        PROJECT_MANAGEMENT,
        INVENTORY_TRACKING,
        QUALITY_CONTROL,
        COMPLIANCE_MONITORING,
        CUSTOM
    }

    public enum Category {
        BUSINESS_INTELLIGENCE,
        OPERATIONAL_EXCELLENCE,
        CUSTOMER_INSIGHTS,
        FINANCIAL_MANAGEMENT,
        SALES_PERFORMANCE,
        MARKETING_ANALYTICS,
        HUMAN_RESOURCES,
        PROJECT_OVERSIGHT,
        COMPLIANCE_RISK,
        CUSTOM
    }

    public enum TargetAudience {
        EXECUTIVE,
        MANAGEMENT,
        OPERATIONAL,
        ANALYTICAL,
        TECHNICAL,
        CUSTOMER_FACING,
        ALL_USERS
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Widget {
        private String id;
        private String title;
        private String description;
        private WidgetType type;
        private Integer positionX;
        private Integer positionY;
        private Integer width;
        private Integer height;
        private Boolean isVisible;
        private Boolean isInteractive;
        private Map<String, Object> configuration;
        private List<String> dataSources;
        private String refreshInterval;
        private Map<String, Object> styling;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardFilter {
        private String id;
        private String name;
        private String field;
        private FilterType type;
        private Boolean isVisible;
        private Boolean isRequired;
        private Object defaultValue;
        private List<String> options;
        private Map<String, Object> configuration;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataSource {
        private String id;
        private String name;
        private String type;
        private String connection;
        private Boolean isActive;
        private Boolean realTime;
        private String lastRefresh;
        private Map<String, Object> configuration;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardPermission {
        private String role;
        private List<String> permissions;
        private Boolean canView;
        private Boolean canEdit;
        private Boolean canShare;
        private Boolean canExport;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExportOption {
        private String format;
        private String name;
        private Boolean isEnabled;
        private Map<String, Object> configuration;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubscriptionSettings {
        private Boolean enabled;
        private String frequency;
        private List<String> recipients;
        private String subject;
        private String template;
        private Map<String, Object> configuration;
    }

    public enum WidgetType {
        KPI_CARD,
        CHART,
        TABLE,
        GAUGE,
        PROGRESS_BAR,
        TREND_INDICATOR,
        HEAT_MAP,
        FUNNEL_CHART,
        SCATTER_PLOT,
        PIE_CHART,
        BAR_CHART,
        LINE_CHART,
        NUMBER_DISPLAY,
        TEXT_WIDGET,
        IMAGE_WIDGET,
        CUSTOM
    }

    public enum FilterType {
        DATE_RANGE,
        TEXT_INPUT,
        DROPDOWN,
        MULTI_SELECT,
        NUMBER_RANGE,
        BOOLEAN,
        CUSTOM
    }
}
