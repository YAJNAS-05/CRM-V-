package com.everx.compliance.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRiskAssessmentRequest {
    private String entityType;
    private String entityId;
    private String riskCategory;
    private String riskLevel;
    private String description;
    private Map<String, Object> riskFactors;
    private String mitigationPlan;
}
