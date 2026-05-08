package com.everx.customersuccess.dto;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class CustomerHealthScoreDTO {
    private Long id;
    private Long customerId;
    private Long managerId;
    private BigDecimal overallScore;
    private String healthCategory;
    private LocalDateTime calculatedDate;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private Map<String, BigDecimal> componentScores;
    private List<String> riskFactors;
    private List<String> positiveFactors;
    private String trend;
    private BigDecimal previousScore;
    private BigDecimal changePercentage;
    private String recommendation;
    private Integer priority;
    private Boolean needsAttention;
    private String notes;
    private List<String> actionItems;
    private LocalDateTime nextReviewDate;
    private String calculatedBy;
    private String methodology;

    // Health score components
    private BigDecimal usageScore;
    private BigDecimal satisfactionScore;
    private BigDecimal engagementScore;
    private BigDecimal supportScore;
    private BigDecimal financialScore;
    private BigDecimal adoptionScore;

    // Constructors
    public CustomerHealthScoreDTO() {}

    public CustomerHealthScoreDTO(Long customerId, BigDecimal overallScore, String healthCategory) {
        this.customerId = customerId;
        this.overallScore = overallScore;
        this.healthCategory = healthCategory;
        this.calculatedDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getManagerId() {
        return managerId;
    }

    public void setManagerId(Long managerId) {
        this.managerId = managerId;
    }

    public BigDecimal getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(BigDecimal overallScore) {
        this.overallScore = overallScore;
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
}
