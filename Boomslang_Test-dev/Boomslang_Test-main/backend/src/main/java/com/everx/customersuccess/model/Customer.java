package com.everx.customersuccess.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "customers")
public class Customer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    private String phone;
    
    private String company;
    
    private String industry;
    
    private String segment;
    
    private String status;
    
    private String tier;
    
    private LocalDateTime joinDate;
    
    private LocalDateTime lastActive;
    
    private String accountManager;
    
    private String customerSuccessManager;
    
    @Column(precision = 10, scale = 2)
    private java.math.BigDecimal contractValue;
    
    private String currency;
    
    private LocalDateTime renewalDate;
    
    private Integer satisfactionScore;
    
    private Integer healthScore;
    
    private String riskLevel;
    
    @Lob
    private String notes;
    
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CustomerEngagement> engagements;
    
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CustomerHealthScore> healthScores;
    
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CustomerSuccessMetrics> metrics;
    
    // Constructors
    public Customer() {}
    
    public Customer(String name, String email, String company) {
        this.name = name;
        this.email = email;
        this.company = company;
        this.joinDate = LocalDateTime.now();
        this.lastActive = LocalDateTime.now();
        this.status = "ACTIVE";
        this.currency = "USD";
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getCompany() {
        return company;
    }
    
    public void setCompany(String company) {
        this.company = company;
    }
    
    public String getIndustry() {
        return industry;
    }
    
    public void setIndustry(String industry) {
        this.industry = industry;
    }
    
    public String getSegment() {
        return segment;
    }
    
    public void setSegment(String segment) {
        this.segment = segment;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getTier() {
        return tier;
    }
    
    public void setTier(String tier) {
        this.tier = tier;
    }
    
    public LocalDateTime getJoinDate() {
        return joinDate;
    }
    
    public void setJoinDate(LocalDateTime joinDate) {
        this.joinDate = joinDate;
    }
    
    public LocalDateTime getLastActive() {
        return lastActive;
    }
    
    public void setLastActive(LocalDateTime lastActive) {
        this.lastActive = lastActive;
    }
    
    public String getAccountManager() {
        return accountManager;
    }
    
    public void setAccountManager(String accountManager) {
        this.accountManager = accountManager;
    }
    
    public String getCustomerSuccessManager() {
        return customerSuccessManager;
    }
    
    public void setCustomerSuccessManager(String customerSuccessManager) {
        this.customerSuccessManager = customerSuccessManager;
    }
    
    public java.math.BigDecimal getContractValue() {
        return contractValue;
    }
    
    public void setContractValue(java.math.BigDecimal contractValue) {
        this.contractValue = contractValue;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public LocalDateTime getRenewalDate() {
        return renewalDate;
    }
    
    public void setRenewalDate(LocalDateTime renewalDate) {
        this.renewalDate = renewalDate;
    }
    
    public Integer getSatisfactionScore() {
        return satisfactionScore;
    }
    
    public void setSatisfactionScore(Integer satisfactionScore) {
        this.satisfactionScore = satisfactionScore;
    }
    
    public Integer getHealthScore() {
        return healthScore;
    }
    
    public void setHealthScore(Integer healthScore) {
        this.healthScore = healthScore;
    }
    
    public String getRiskLevel() {
        return riskLevel;
    }
    
    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public List<CustomerEngagement> getEngagements() {
        return engagements;
    }
    
    public void setEngagements(List<CustomerEngagement> engagements) {
        this.engagements = engagements;
    }
    
    public List<CustomerHealthScore> getHealthScores() {
        return healthScores;
    }
    
    public void setHealthScores(List<CustomerHealthScore> healthScores) {
        this.healthScores = healthScores;
    }
    
    public List<CustomerSuccessMetrics> getMetrics() {
        return metrics;
    }
    
    public void setMetrics(List<CustomerSuccessMetrics> metrics) {
        this.metrics = metrics;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.lastActive = LocalDateTime.now();
    }
}
