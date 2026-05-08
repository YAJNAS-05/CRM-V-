package com.everx.customersuccess.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "customer_success_metrics")
public class CustomerSuccessMetrics {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private CustomerSuccessManager manager;
    
    @Column(nullable = false)
    private String metricType;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal value;
    
    private String unit;
    
    @Column(nullable = false)
    private LocalDateTime recordedDate;
    
    private LocalDateTime periodStart;
    
    private LocalDateTime periodEnd;
    
    private String category;
    
    @Lob
    private String description;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal target;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal previousValue;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal changePercentage;
    
    private String trend;
    
    @Column(nullable = false)
    private Boolean isPositive;
    
    private String source;
    
    @Lob
    private String notes;
    
    // Constructors
    public CustomerSuccessMetrics() {}
    
    public CustomerSuccessMetrics(Customer customer, String metricType, BigDecimal value) {
        this.customer = customer;
        this.metricType = metricType;
        this.value = value;
        this.recordedDate = LocalDateTime.now();
        this.isPositive = true;
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
    
    public String getMetricType() {
        return metricType;
    }
    
    public void setMetricType(String metricType) {
        this.metricType = metricType;
    }
    
    public BigDecimal getValue() {
        return value;
    }
    
    public void setValue(BigDecimal value) {
        this.value = value;
    }
    
    public String getUnit() {
        return unit;
    }
    
    public void setUnit(String unit) {
        this.unit = unit;
    }
    
    public LocalDateTime getRecordedDate() {
        return recordedDate;
    }
    
    public void setRecordedDate(LocalDateTime recordedDate) {
        this.recordedDate = recordedDate;
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
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public BigDecimal getTarget() {
        return target;
    }
    
    public void setTarget(BigDecimal target) {
        this.target = target;
    }
    
    public BigDecimal getPreviousValue() {
        return previousValue;
    }
    
    public void setPreviousValue(BigDecimal previousValue) {
        this.previousValue = previousValue;
    }
    
    public BigDecimal getChangePercentage() {
        return changePercentage;
    }
    
    public void setChangePercentage(BigDecimal changePercentage) {
        this.changePercentage = changePercentage;
    }
    
    public String getTrend() {
        return trend;
    }
    
    public void setTrend(String trend) {
        this.trend = trend;
    }
    
    public Boolean getIsPositive() {
        return isPositive;
    }
    
    public void setIsPositive(Boolean isPositive) {
        this.isPositive = isPositive;
    }
    
    public String getSource() {
        return source;
    }
    
    public void setSource(String source) {
        this.source = source;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    @PrePersist
    @PreUpdate
    public void calculateChangePercentage() {
        if (previousValue != null && previousValue.compareTo(BigDecimal.ZERO) != 0) {
            BigDecimal change = value.subtract(previousValue);
            this.changePercentage = change.divide(previousValue, 2, BigDecimal.ROUND_HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            
            // Set trend based on change
            if (change.compareTo(BigDecimal.ZERO) > 0) {
                this.trend = "UP";
            } else if (change.compareTo(BigDecimal.ZERO) < 0) {
                this.trend = "DOWN";
            } else {
                this.trend = "STABLE";
            }
            
            // Set isPositive based on metric type and trend
            this.isPositive = determineIfPositive();
        }
    }
    
    private Boolean determineIfPositive() {
        if (trend == null || "STABLE".equals(trend)) {
            return true;
        }
        
        // For metrics where lower is better (like churn rate, response time)
        if ("CHURN_RATE".equals(metricType) || "RESPONSE_TIME".equals(metricType) || 
            "ERROR_RATE".equals(metricType) || "COMPLAINT_RATE".equals(metricType)) {
            return "DOWN".equals(trend);
        }
        
        // For metrics where higher is better
        return "UP".equals(trend);
    }
}
