package com.everx.hr.performance.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class UpdatePerformanceReviewRequest {
    private UUID reviewerId;
    private String reviewPeriod;
    private String status;
    private Integer overallRating;
    private Integer goalsRating;
    private Integer skillsRating;
    private String comments;
    private String reviewerNotes;
    private LocalDate reviewDate;
}
