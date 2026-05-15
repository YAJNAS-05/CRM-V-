package com.everx.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleReportRequest {
    private String scheduleName;
    private String frequency;                       // DAILY / WEEKLY / MONTHLY
    private String cronExpression;
    private String[] recipients;
    private String exportFormat;
    private Object filters;
}
