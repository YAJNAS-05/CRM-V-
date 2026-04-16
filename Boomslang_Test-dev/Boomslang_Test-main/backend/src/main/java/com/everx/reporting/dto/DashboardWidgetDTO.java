package com.everx.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardWidgetDTO {
    private Long widgetId;
    private Long dashboardId;
    private Long reportId;
    private String widgetType;
    private String widgetTitle;
    private String widgetKey;
    private String description;
    
    // Layout
    private Integer colIndex;
    private Integer rowIndex;
    private Integer colSpan;
    private Integer rowSpan;
    private String backgroundColor;
    private String fontSize;
    
    // Configuration
    private Object config;
    private String chartType;
    private String metricField;
    private String metricLabel;
    private String metricFormat;
    private Object filtersApplied;
    private Object sortConfig;
    
    // Refresh settings
    private Integer refreshInterval;
    private Integer cacheDuration;
    private Boolean isCached;
    private LocalDateTime lastRefreshedAt;
    
    // Visibility
    private Boolean isVisible;
    private Boolean isLocked;
    private Integer widgetOrder;
    
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
