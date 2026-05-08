package com.everx.compliance.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateReportRequest {
    private String frameworkCode;
    private String reportType;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private List<String> entityTypes;
    private List<String> entityIds;
    private boolean includeRecommendations;
    private String format;
}
