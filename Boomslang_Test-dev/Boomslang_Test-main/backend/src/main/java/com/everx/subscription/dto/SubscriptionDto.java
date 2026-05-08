package com.everx.subscription.dto;

import com.everx.subscription.entity.Subscription;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class SubscriptionDto {
    private UUID id;
    private UUID tenantId;
    private SubscriptionPlanDto subscriptionPlan;
    private Subscription.SubscriptionStatus status;
    private Subscription.BillingCycle billingCycle;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate trialEndDate;
    private LocalDate nextBillingDate;
    private BigDecimal price;
    private String currency;
    private Boolean isActive;
    private Boolean isAutoRenew;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private Integer maxUsers;
    private Integer maxStorageGb;
    private Integer maxApiCallsMonthly;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
