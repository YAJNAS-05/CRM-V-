package com.everx.subscription.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class SubscriptionPlanDto {
    private UUID id;
    private String name;
    private String displayName;
    private String description;
    private BigDecimal priceMonthly;
    private BigDecimal priceYearly;
    private String currency;
    private Integer maxUsers;
    private Integer maxStorageGb;
    private Integer maxApiCallsMonthly;
    private Integer trialDays;
    private Boolean isActive;
    private Boolean isPublic;
    private Integer sortOrder;
    private String billingCycle;
    private BigDecimal setupFee;
    private Boolean isPopular;
    private Boolean isEnterprise;
    private BigDecimal yearlyDiscount;
}
