package com.everx.crm.leadscore.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadScoreCalculationDto {

    private UUID leadId;
    private Integer activityScore;
    private Integer predictiveScore;
    private Integer totalScore;
    private String grade;
    private String qualificationStatus;
    private String nextBestAction;
}
