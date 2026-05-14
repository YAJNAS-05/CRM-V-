package com.everx.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateDashboardWidgetRequest {
    private String widgetType;
    private String widgetTitle;
    private String description;
    private Integer colIndex;
    private Integer rowIndex;
    private Integer colSpan;
    private Integer rowSpan;
    private String backgroundColor;
    private String fontSize;
    private Object config;
    private String chartType;
    private String metricField;
    private String metricLabel;
    private String metricFormat;
    private Object filtersApplied;
    private Object sortConfig;
    private Integer refreshInterval;
    private Long reportId;
}
