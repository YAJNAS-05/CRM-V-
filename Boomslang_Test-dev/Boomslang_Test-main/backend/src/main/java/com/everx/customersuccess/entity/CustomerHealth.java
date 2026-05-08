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
@Table(name = "customer_health")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerHealth {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "customer_id", nullable = false)
    private UUID customerId;

    @Column(name = "overall_health_score", nullable = false)
    private Integer overallHealthScore;

    @Column(name = "product_adoption_score")
    private Integer productAdoptionScore;

    @Column(name = "usage_frequency_score")
    private Integer usageFrequencyScore;

    @Column(name = "feature_utilization_score")
    private Integer featureUtilizationScore;

    @Column(name = "support_ticket_score")
    private Integer supportTicketScore;

    @Column(name = "nps_score")
    private Integer npsScore;

    @Column(name = "csat_score")
    private Integer csatScore;

    @Column(name = "renewal_probability")
    private Integer renewalProbability;

    @Column(name = "expansion_probability")
    private Integer expansionProbability;

    @Column(name = "churn_risk_score")
    private Integer churnRiskScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "health_status", nullable = false)
    private HealthStatus healthStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false)
    private RiskLevel riskLevel;

    @Column(name = "last_activity_date")
    private LocalDateTime lastActivityDate;

    @Column(name = "days_since_last_activity")
    private Integer daysSinceLastActivity;

    @Column(name = "active_users_count")
    private Integer activeUsersCount;

    @Column(name = "total_users_count")
    private Integer totalUsersCount;

    @Column(name = "user_adoption_rate")
    private Double userAdoptionRate;

    @Column(name = "key_features_used")
    private Integer keyFeaturesUsed;

    @Column(name = "total_key_features")
    private Integer totalKeyFeatures;

    @Column(name = "feature_adoption_rate")
    private Double featureAdoptionRate;

    @Column(name = "support_tickets_open")
    private Integer supportTicketsOpen;

    @Column(name = "support_tickets_resolved")
    private Integer supportTicketsResolved;

    @Column(name = "average_resolution_time_hours")
    private Double averageResolutionTimeHours;

    @Column(name = "escalation_count")
    private Integer escalationCount;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "health_factors")
    private List<HealthFactor> healthFactors;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "recommendations")
    private List<Recommendation> recommendations;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "alerts")
    private List<HealthAlert> alerts;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "trend_data")
    private Map<String, Object> trendData;

    @Column(name = "calculated_at", nullable = false)
    private LocalDateTime calculatedAt;

    @Column(name = "next_review_date")
    private LocalDateTime nextReviewDate;

    @Column(name = "review_frequency_days")
    private Integer reviewFrequencyDays;

    @Column(name = "last_review_date")
    private LocalDateTime lastReviewDate;

    @Column(name = "reviewed_by")
    private String reviewedBy;

    @Column(name = "notes")
    private String notes;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    private Map<String, Object> metadata;

    // Helper methods
    public boolean isHealthy() {
        return HealthStatus.HEALTHY.equals(healthStatus) && overallHealthScore >= 70;
    }

    public boolean isAtRisk() {
        return RiskLevel.HIGH.equals(riskLevel) || overallHealthScore < 50;
    }

    public boolean needsAttention() {
        return HealthStatus.NEEDS_ATTENTION.equals(healthStatus) || 
               (overallHealthScore >= 50 && overallHealthScore < 70);
    }

    public boolean hasHighChurnRisk() {
        return churnRiskScore != null && churnRiskScore >= 70;
    }

    public boolean hasLowAdoption() {
        return productAdoptionScore != null && productAdoptionScore < 40;
    }

    public boolean hasSupportIssues() {
        return supportTicketScore != null && supportTicketScore < 50;
    }

    public boolean needsReview() {
        return nextReviewDate != null && LocalDateTime.now().isAfter(nextReviewDate);
    }

    public void calculateOverallHealthScore() {
        // Weighted calculation of health score
        double weightedScore = 0.0;
        int totalWeight = 0;

        if (productAdoptionScore != null) {
            weightedScore += productAdoptionScore * 0.25;
            totalWeight += 25;
        }

        if (usageFrequencyScore != null) {
            weightedScore += usageFrequencyScore * 0.20;
            totalWeight += 20;
        }

        if (featureUtilizationScore != null) {
            weightedScore += featureUtilizationScore * 0.15;
            totalWeight += 15;
        }

        if (supportTicketScore != null) {
            weightedScore += supportTicketScore * 0.15;
            totalWeight += 15;
        }

        if (npsScore != null) {
            weightedScore += npsScore * 0.15;
            totalWeight += 15;
        }

        if (csatScore != null) {
            weightedScore += csatScore * 0.10;
            totalWeight += 10;
        }

        if (totalWeight > 0) {
            this.overallHealthScore = (int) (weightedScore / totalWeight * 100);
        }

        updateHealthStatus();
        updateRiskLevel();
    }

    public void updateHealthStatus() {
        if (overallHealthScore >= 80) {
            this.healthStatus = HealthStatus.HEALTHY;
        } else if (overallHealthScore >= 60) {
            this.healthStatus = HealthStatus.NEEDS_ATTENTION;
        } else {
            this.healthStatus = HealthStatus.AT_RISK;
        }
    }

    public void updateRiskLevel() {
        if (overallHealthScore >= 80 && churnRiskScore != null && churnRiskScore < 30) {
            this.riskLevel = RiskLevel.LOW;
        } else if (overallHealthScore >= 60 && churnRiskScore != null && churnRiskScore < 60) {
            this.riskLevel = RiskLevel.MEDIUM;
        } else {
            this.riskLevel = RiskLevel.HIGH;
        }
    }

    public void calculateAdoptionRates() {
        if (activeUsersCount != null && totalUsersCount != null && totalUsersCount > 0) {
            this.userAdoptionRate = (double) activeUsersCount / totalUsersCount * 100;
        }

        if (keyFeaturesUsed != null && totalKeyFeatures != null && totalKeyFeatures > 0) {
            this.featureAdoptionRate = (double) keyFeaturesUsed / totalKeyFeatures * 100;
        }
    }

    public void addHealthFactor(HealthFactor factor) {
        if (this.healthFactors == null) {
            this.healthFactors = new java.util.ArrayList<>();
        }
        this.healthFactors.add(factor);
    }

    public void addRecommendation(Recommendation recommendation) {
        if (this.recommendations == null) {
            this.recommendations = new java.util.ArrayList<>();
        }
        this.recommendations.add(recommendation);
    }

    public void addAlert(HealthAlert alert) {
        if (this.alerts == null) {
            this.alerts = new java.util.ArrayList<>();
        }
        this.alerts.add(alert);
    }

    public boolean hasActiveAlerts() {
        return alerts != null && alerts.stream()
                .anyMatch(alert -> !AlertStatus.RESOLVED.equals(alert.getStatus()));
    }

    public long getUnresolvedAlertsCount() {
        if (alerts == null) return 0;
        return alerts.stream()
                .filter(alert -> !AlertStatus.RESOLVED.equals(alert.getStatus()))
                .count();
    }

    public void scheduleNextReview() {
        if (reviewFrequencyDays != null && calculatedAt != null) {
            this.nextReviewDate = calculatedAt.plusDays(reviewFrequencyDays);
        }
    }

    public enum HealthStatus {
        HEALTHY,
        NEEDS_ATTENTION,
        AT_RISK,
        CRITICAL
    }

    public enum RiskLevel {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HealthFactor {
        private String name;
        private String description;
        private Double weight;
        private Integer score;
        private String impact;
        private LocalDateTime calculatedAt;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Recommendation {
        private String title;
        private String description;
        private RecommendationType type;
        private RecommendationPriority priority;
        private String suggestedAction;
        private String owner;
        private LocalDateTime dueDate;
        private Boolean isImplemented;
    }

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HealthAlert {
        private String title;
        private String description;
        private AlertType type;
        private AlertSeverity severity;
        private AlertStatus status;
        private LocalDateTime triggeredAt;
        private LocalDateTime resolvedAt;
        private String resolvedBy;
        private String resolutionNotes;
    }

    public enum RecommendationType {
        ADOPTION_IMPROVEMENT,
        USAGE_OPTIMIZATION,
        SUPPORT_INTERVENTION,
        TRAINING_NEEDED,
        FEATURE_ENABLEMENT,
        PRICING_ADJUSTMENT,
        ACCOUNT_REVIEW
    }

    public enum RecommendationPriority {
        LOW,
        MEDIUM,
        HIGH,
        URGENT
    }

    public enum AlertType {
        CHURN_RISK,
        LOW_ADOPTION,
        SUPPORT_ISSUES,
        USAGE_DECLINE,
    FEATURE_UNUSED,
    PAYMENT_ISSUE,
    CONTRACT_RENEWAL
    }

    public enum AlertSeverity {
        INFO,
        WARNING,
        ERROR,
    CRITICAL
    }

    public enum AlertStatus {
        ACTIVE,
        ACKNOWLEDGED,
        RESOLVED,
        SUPPRESSED
    }
}
