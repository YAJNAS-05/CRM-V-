package com.everx.hr.performance;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "performance_reviews", schema = "everx_hr")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceReview extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "reviewer_id")
    private UUID reviewerId;

    @Column(name = "review_period", nullable = false, length = 50)
    private String reviewPeriod;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "DRAFT";

    @Column(name = "overall_rating")
    private Integer overallRating;

    @Column(name = "goals_rating")
    private Integer goalsRating;

    @Column(name = "skills_rating")
    private Integer skillsRating;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    @Column(name = "reviewer_notes", columnDefinition = "TEXT")
    private String reviewerNotes;

    @Column(name = "review_date")
    private LocalDate reviewDate;
}
