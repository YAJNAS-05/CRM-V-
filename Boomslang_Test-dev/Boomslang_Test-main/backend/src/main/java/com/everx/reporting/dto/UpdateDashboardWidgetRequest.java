package com.everx.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateDashboardWidgetRequest {
    private String widgetTitle;
    private String description;
    private Integer colIndex;
    private Integer rowIndex;
    private Integer colSpan;
    private Integer rowSpan;
    private String backgroundColor;
    private String fontSize;
    private Object config;
    private Object filtersApplied;
    private Object sortConfig;
    private Boolean isVisible;
    private Boolean isLocked;
    private Integer refreshInterval;
}
