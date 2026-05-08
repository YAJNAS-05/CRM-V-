package com.everx.saas.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "subscriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;
    
    @Column(nullable = false)
    private String planType;
    
    @Column(nullable = false)
    private String status;
    
    @Column(nullable = false)
    private BigDecimal monthlyPrice;
    
    @Column(nullable = false)
    private BigDecimal yearlyPrice;
    
    @Column(name = "max_users")
    private Integer maxUsers;
    
    @Column(name = "max_storage_gb")
    private Integer maxStorageGb;
    
    @Column(name = "features", columnDefinition = "TEXT")
    private String features;
    
    @Column(name = "trial_end")
    private LocalDateTime trialEnd;
    
    @Column(name = "next_billing_date")
    private LocalDateTime nextBillingDate;
    
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
