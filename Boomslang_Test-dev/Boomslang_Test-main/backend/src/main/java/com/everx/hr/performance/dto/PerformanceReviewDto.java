package com.everx.hr.performance.dto;

import com.everx.hr.performance.PerformanceReview;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceReviewDto {

    private UUID id;
    private UUID employeeId;
    private UUID reviewerId;
    private String reviewPeriod;
    private String status;
    private Integer overallRating;
    private Integer goalsRating;
    private Integer skillsRating;
    private String comments;
    private String reviewerNotes;
    private LocalDate reviewDate;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static PerformanceReviewDto fromEntity(PerformanceReview review) {
        return PerformanceReviewDto.builder()
                .id(review.getId())
                .employeeId(review.getEmployeeId())
                .reviewerId(review.getReviewerId())
                .reviewPeriod(review.getReviewPeriod())
                .status(review.getStatus())
                .overallRating(review.getOverallRating())
                .goalsRating(review.getGoalsRating())
                .skillsRating(review.getSkillsRating())
                .comments(review.getComments())
                .reviewerNotes(review.getReviewerNotes())
                .reviewDate(review.getReviewDate())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
