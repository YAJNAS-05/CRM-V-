package com.everx.security.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsRequest {
    private String timeRange;
    private String startDate;
    private String endDate;
    private String granularity;
    private String[] metrics;
    private String[] dimensions;
}
