package com.everx.customersuccess.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "cost_optimizations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CostOptimization {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "optimization_name", nullable = false)
    private String optimizationName;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "optimization_type", nullable = false)
    private OptimizationType optimizationType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    private Priority priority;

    @Column(name = "current_monthly_cost")
    private Double currentMonthlyCost;

    @Column(name = "projected_monthly_cost")
    private Double projectedMonthlyCost;

    @Column(name = "monthly_savings")
    private Double monthlySavings;

    @Column(name = "annual_savings")
    private Double annualSavings;

    @Column(name = "implementation_cost")
    private Double implementationCost;

    @Column(name = "roi_percentage")
    private Double roiPercentage;

    @Column(name = "payback_period_months")
    private Integer paybackPeriodMonths;

    @Column(name = "effort_required")
    private String effortRequired;

    @Column(name = "impact_level")
    private String impactLevel;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "cost_breakdown")
    private List<CostBreakdown> costBreakdown;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "optimization_steps")
    private List<OptimizationStep> optimizationSteps;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metrics")
    private List<Metric> metrics;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "recommendations")
    private List<Recommendation> recommendations;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "implemented_at")
    private LocalDateTime implementedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewed_by")
    private String reviewedBy;

    @Column(name = "next_review_date")
    private LocalDateTime nextReviewDate;

    @Column(name = "target_completion_date")
    private LocalDateTime targetCompletionDate;

    @Column(name = "actual_completion_date")
    private LocalDateTime actualCompletionDate;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tracking_data")
    private Map<String, Object> trackingData;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "before_after_metrics")
    private Map<String, Object> beforeAfterMetrics;

    @Column(name = "notes")
    private String notes;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    private Map<String, Object> metadata;

    @Column(name = "tags")
    private List<String> tags;

    @Column(name = "category")
    private String category;

    @Column(name = "is_recurring")
    private Boolean isRecurring;

    @Column(name = "recurring_frequency")
    private String recurringFrequency;

    // Helper methods
    public boolean isActive() {
        return Status.ACTIVE.equals(status);
    }

    public boolean isImplemented() {
        return Status.IMPLEMENTED.equals(status);
    }

    public boolean isCompleted() {
        return Status.COMPLETED.equals(status);
    }

    public boolean hasPositiveROI() {
        return roiPercentage != null && roiPercentage > 0;
    }

    public boolean hasHighImpact() {
        return "HIGH".equals(impactLevel) || (annualSavings != null && annualSavings > 10000);
    }

    public boolean needsReview() {
        return nextReviewDate != null && LocalDateTime.now().isAfter(nextReviewDate);
    }

    public boolean isOverdue() {
        return targetCompletionDate != null && 
               LocalDateTime.now().isAfter(targetCompletionDate) && 
               !isCompleted();
    }

    public void calculateSavings() {
        if (currentMonthlyCost != null && projectedMonthlyCost != null) {
            this.monthlySavings = currentMonthlyCost - projectedMonthlyCost;
            this.annualSavings = monthlySavings * 12;
        }
    }

    public void calculateROI() {
        if (annualSavings != null && implementationCost != null && implementationCost > 0) {
            this.roiPercentage = (annualSavings / implementationCost) * 100;
        }
    }

    public void calculatePaybackPeriod() {
        if (monthlySavings != null && monthlySavings > 0 && implementationCost != null) {
            this.paybackPeriodMonths = (int) Math.ceil(implementationCost / monthlySavings);
        }
    }

    public void calculateAllMetrics() {
        calculateSavings();
        calculateROI();
        calculatePaybackPeriod();
    }

    public void implement(String implementedBy) {
        this.status = Status.IMPLEMENTED;
        this.implementedAt = LocalDateTime.now();
        this.updatedBy = implementedBy;
        this.updatedAt = LocalDateTime.now();
    }

    public void complete(String completedBy) {
        this.status = Status.COMPLETED;
        this.actualCompletionDate = LocalDateTime.now();
        this.updatedBy = completedBy;
        this.updatedAt = LocalDateTime.now();
    }

    public void review(String reviewedBy, String notes) {
        this.reviewedAt = LocalDateTime.now();
        this.reviewedBy = reviewedBy;
        this.notes = notes;
        
        // Schedule next review in 3 months
        this.nextReviewDate = LocalDateTime.now().plusMonths(3);
    }

    public void addCostBreakdown(CostBreakdown breakdown) {
        if (this.costBreakdown == null) {
            this.costBreakdown = new java.util.ArrayList<>();
        }
        this.costBreakdown.add(breakdown);
    }

    public void addOptimizationStep(OptimizationStep step) {
        if (this.optimizationSteps == null) {
            this.optimizationSteps = new java.util.ArrayList<>();
        }
        this.optimizationSteps.add(step);
    }

    public void addMetric(Metric metric) {
        if (this.metrics == null) {
            this.metrics = new java.util.ArrayList<>();
        }
        this.metrics.add(metric);
    }

    public void addRecommendation(Recommendation recommendation) {
        if (this.recommendations == null) {
            this.recommendations = new java.util.ArrayList<>();
        }
        this.recommendations.add(recommendation);
    }

    public void updateTrackingData(String key, Object value) {
        if (this.trackingData == null) {
            this.trackingData = new java.util.HashMap<>();
        }
        this.trackingData.put(key, value);
    }

    public Double getTotalSavingsToDate() {
        if (implementedAt == null || monthlySavings == null) return 0.0;
        
        long monthsBetween = java.time.temporal.ChronoUnit.MONTHS.between(
                implementedAt.toLocalDate(), 
                LocalDateTime.now().toLocalDate()
        );
        
        return monthlySavings * Math.max(0, monthsBetween);
    }

    public boolean hasAchievedPayback() {
        if (paybackPeriodMonths == null || implementedAt == null) return false;
        
        long monthsSinceImplementation = java.time.temporal.ChronoUnit.MONTHS.between(
                implementedAt.toLocalDate(), 
                LocalDateTime.now().toLocalDate()
        );
        
        return monthsSinceImplementation >= paybackPeriodMonths;
    }

    public enum OptimizationType {
        LICENSE_OPTIMIZATION,
        SUBSCRIPTION_MANAGEMENT,
        RESOURCE_CONSOLIDATION,
        AUTOMATION,
        PROCESS_IMPROVEMENT,
        INFRASTRUCTURE_OPTIMIZATION,
        VENDOR_NEGOTIATION,
        USAGE_OPTIMIZATION,
        FEATURE_RIGHTSIZING,
        STORAGE_OPTIMIZATION,
        BANDWIDTH_OPTIMIZATION,
        CUSTOM
    }

    public enum Status {
        PROPOSED,
        ACTIVE,
        IMPLEMENTED,
        COMPLETED,
        CANCELLED,
        ON_HOLD
    }

    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CostBreakdown {
        private String category;
        private String description;
        private Double currentCost;
        private Double projectedCost;
        private Double savings;
        private String unit;
        private Integer quantity;
        private String vendor;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptimizationStep {
        private String title;
        private String description;
        private StepStatus status;
        private LocalDateTime dueDate;
        private LocalDateTime completedDate;
        private String assignedTo;
        private Integer estimatedHours;
        private Integer actualHours;
        private List<String> dependencies;
        private List<String> prerequisites;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Metric {
        private String name;
        private String description;
        private String unit;
        private Double beforeValue;
        private Double afterValue;
        private Double targetValue;
        private Double currentValue;
        private LocalDateTime measuredAt;
        private Boolean isAchieved;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Recommendation {
        private String title;
        private String description;
        private RecommendationType type;
        private String impact;
        private String effort;
        private String priority;
        private String suggestedBy;
        private LocalDateTime suggestedAt;
        private Boolean isImplemented;
        private LocalDateTime implementedAt;
    }

    public enum StepStatus {
        NOT_STARTED,
        IN_PROGRESS,
        COMPLETED,
        BLOCKED,
        CANCELLED
    }

    public enum RecommendationType {
        IMMEDIATE_ACTION,
        SHORT_TERM,
        LONG_TERM,
        MONITORING_NEEDED,
        FURTHER_ANALYSIS,
        BEST_PRACTICE
    }
}
