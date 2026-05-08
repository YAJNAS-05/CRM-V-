package com.everx.fieldwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechnicianPerformanceDto {
    
    private String technicianId;
    
    private String technicianName;
    
    private Integer jobsCompleted;
    
    private Integer jobsInProgress;
    
    private BigDecimal averageRating;
    
    private Integer totalRatings;
    
    private BigDecimal totalEarnings;
    
    private BigDecimal averageJobDuration;
    
    private Integer onTimeCompletionRate;
    
    private Integer customerSatisfactionScore;
    
    private LocalDateTime lastJobDate;
    
    private LocalDateTime lastRatingDate;
    
    private Integer jobsThisMonth;
    
    private Integer jobsThisQuarter;
    
    private Integer jobsThisYear;
    
    private BigDecimal earningsThisMonth;
    
    private BigDecimal earningsThisQuarter;
    
    private BigDecimal earningsThisYear;
    
    private Integer topSkillsCount;
    
    private Integer certificationsCount;
    
    private Integer trainingHoursCompleted;
    
    private Integer safetyIncidents;
    
    private Integer customerComplaints;
    
    private Integer customerCompliments;
    
    private Integer repeatCustomers;
    
    private BigDecimal utilizationRate;
    
    private Integer availabilityRate;
    
    private Integer responseRate;
    
    private Integer firstTimeFixRate;
    
    private Integer callbackRate;
    
    private Integer partsEfficiency;
    
    private Integer timeEfficiency;
    
    private Integer qualityScore;
    
    private Integer safetyScore;
    
    private Integer teamworkScore;
    
    private Integer communicationScore;
    
    private Integer problemSolvingScore;
    
    private Integer technicalSkillsScore;
    
    private Integer overallScore;
    
    private LocalDateTime lastUpdated;
}
