package com.everx.customersuccess.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "customer_health_scores")
public class CustomerHealthScore {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private CustomerSuccessManager manager;
    
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal overallScore;
    
    @Column(nullable = false)
    private String healthCategory;
    
    @Column(nullable = false)
    private LocalDateTime calculatedDate;
    
    private LocalDateTime periodStart;
    
    private LocalDateTime periodEnd;
    
    @ElementCollection
    @CollectionTable(name = "health_component_scores", joinColumns = @JoinColumn(name = "health_score_id"))
    @MapKeyColumn(name = "component_name")
    @Column(name = "score", precision = 5, scale = 2)
    private Map<String, BigDecimal> componentScores;
    
    @ElementCollection
    @CollectionTable(name = "health_risk_factors", joinColumns = @JoinColumn(name = "health_score_id"))
    @Column(name = "risk_factor")
    private List<String> riskFactors;
    
    @ElementCollection
    @CollectionTable(name = "health_positive_factors", joinColumns = @JoinColumn(name = "health_score_id"))
    @Column(name = "positive_factor")
    private List<String> positiveFactors;
    
    private String trend;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal previousScore;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal changePercentage;
    
    @Lob
    private String recommendation;
    
    private Integer priority;
    
    @Column(nullable = false)
    private Boolean needsAttention;
    
    @Lob
    private String notes;
    
    @ElementCollection
    @CollectionTable(name = "health_action_items", joinColumns = @JoinColumn(name = "health_score_id"))
    @Column(name = "action_item")
    private List<String> actionItems;
    
    private LocalDateTime nextReviewDate;
    
    private String calculatedBy;
    
    private String methodology;
    
    // Individual component scores
    @Column(precision = 5, scale = 2)
    private BigDecimal usageScore;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal satisfactionScore;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal engagementScore;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal supportScore;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal financialScore;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal adoptionScore;
    
    // Constructors
    public CustomerHealthScore() {}
    
    public CustomerHealthScore(Customer customer, BigDecimal overallScore, String healthCategory) {
        this.customer = customer;
        this.overallScore = overallScore;
        this.healthCategory = healthCategory;
        this.calculatedDate = LocalDateTime.now();
        this.needsAttention = overallScore.compareTo(BigDecimal.valueOf(70)) < 0;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Customer getCustomer() {
        return customer;
    }
    
    public void setCustomer(Customer customer) {
        this.customer = customer;
    }
    
    public CustomerSuccessManager getManager() {
        return manager;
    }
    
    public void setManager(CustomerSuccessManager manager) {
        this.manager = manager;
    }
    
    public BigDecimal getOverallScore() {
        return overallScore;
    }
    
    public void setOverallScore(BigDecimal overallScore) {
        this.overallScore = overallScore;
        // Auto-update needsAttention based on score
        this.needsAttention = overallScore.compareTo(BigDecimal.valueOf(70)) < 0;
    }
    
    public String getHealthCategory() {
        return healthCategory;
    }
    
    public void setHealthCategory(String healthCategory) {
        this.healthCategory = healthCategory;
    }
    
    public LocalDateTime getCalculatedDate() {
        return calculatedDate;
    }
    
    public void setCalculatedDate(LocalDateTime calculatedDate) {
        this.calculatedDate = calculatedDate;
    }
    
    public LocalDateTime getPeriodStart() {
        return periodStart;
    }
    
    public void setPeriodStart(LocalDateTime periodStart) {
        this.periodStart = periodStart;
    }
    
    public LocalDateTime getPeriodEnd() {
        return periodEnd;
    }
    
    public void setPeriodEnd(LocalDateTime periodEnd) {
        this.periodEnd = periodEnd;
    }
    
    public Map<String, BigDecimal> getComponentScores() {
        return componentScores;
    }
    
    public void setComponentScores(Map<String, BigDecimal> componentScores) {
        this.componentScores = componentScores;
    }
    
    public List<String> getRiskFactors() {
        return riskFactors;
    }
    
    public void setRiskFactors(List<String> riskFactors) {
        this.riskFactors = riskFactors;
    }
    
    public List<String> getPositiveFactors() {
        return positiveFactors;
    }
    
    public void setPositiveFactors(List<String> positiveFactors) {
        this.positiveFactors = positiveFactors;
    }
    
    public String getTrend() {
        return trend;
    }
    
    public void setTrend(String trend) {
        this.trend = trend;
    }
    
    public BigDecimal getPreviousScore() {
        return previousScore;
    }
    
    public void setPreviousScore(BigDecimal previousScore) {
        this.previousScore = previousScore;
    }
    
    public BigDecimal getChangePercentage() {
        return changePercentage;
    }
    
    public void setChangePercentage(BigDecimal changePercentage) {
        this.changePercentage = changePercentage;
    }
    
    public String getRecommendation() {
        return recommendation;
    }
    
    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }
    
    public Integer getPriority() {
        return priority;
    }
    
    public void setPriority(Integer priority) {
        this.priority = priority;
    }
    
    public Boolean getNeedsAttention() {
        return needsAttention;
    }
    
    public void setNeedsAttention(Boolean needsAttention) {
        this.needsAttention = needsAttention;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public List<String> getActionItems() {
        return actionItems;
    }
    
    public void setActionItems(List<String> actionItems) {
        this.actionItems = actionItems;
    }
    
    public LocalDateTime getNextReviewDate() {
        return nextReviewDate;
    }
    
    public void setNextReviewDate(LocalDateTime nextReviewDate) {
        this.nextReviewDate = nextReviewDate;
    }
    
    public String getCalculatedBy() {
        return calculatedBy;
    }
    
    public void setCalculatedBy(String calculatedBy) {
        this.calculatedBy = calculatedBy;
    }
    
    public String getMethodology() {
        return methodology;
    }
    
    public void setMethodology(String methodology) {
        this.methodology = methodology;
    }
    
    public BigDecimal getUsageScore() {
        return usageScore;
    }
    
    public void setUsageScore(BigDecimal usageScore) {
        this.usageScore = usageScore;
    }
    
    public BigDecimal getSatisfactionScore() {
        return satisfactionScore;
    }
    
    public void setSatisfactionScore(BigDecimal satisfactionScore) {
        this.satisfactionScore = satisfactionScore;
    }
    
    public BigDecimal getEngagementScore() {
        return engagementScore;
    }
    
    public void setEngagementScore(BigDecimal engagementScore) {
        this.engagementScore = engagementScore;
    }
    
    public BigDecimal getSupportScore() {
        return supportScore;
    }
    
    public void setSupportScore(BigDecimal supportScore) {
        this.supportScore = supportScore;
    }
    
    public BigDecimal getFinancialScore() {
        return financialScore;
    }
    
    public void setFinancialScore(BigDecimal financialScore) {
        this.financialScore = financialScore;
    }
    
    public BigDecimal getAdoptionScore() {
        return adoptionScore;
    }
    
    public void setAdoptionScore(BigDecimal adoptionScore) {
        this.adoptionScore = adoptionScore;
    }
    
    @PrePersist
    @PreUpdate
    public void calculateHealthCategory() {
        if (overallScore != null) {
            if (overallScore.compareTo(BigDecimal.valueOf(90)) >= 0) {
                this.healthCategory = "EXCELLENT";
            } else if (overallScore.compareTo(BigDecimal.valueOf(80)) >= 0) {
                this.healthCategory = "HEALTHY";
            } else if (overallScore.compareTo(BigDecimal.valueOf(70)) >= 0) {
                this.healthCategory = "AT_RISK";
            } else {
                this.healthCategory = "CRITICAL";
            }
        }
    }
}
