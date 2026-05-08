package com.everx.compliance.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsRequest {
    private String reportType;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String entityType;
    private String entityId;
    private String frameworkCode;
}
