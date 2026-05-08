package com.everx.tenant.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class TenantDto {
    private UUID id;
    private String name;
    private String subdomain;
    private String customDomain;
    private String industry;
    private Integer companySize;
    private String description;
    private String logoUrl;
    private String primaryColor;
    private String secondaryColor;
    private String timezone;
    private String locale;
    private String currency;
    private String dateFormat;
    private String timeFormat;
    private Boolean isActive;
    private Boolean isTrial;
    private LocalDateTime trialEndDate;
    private String subscriptionPlan;
    private Integer maxUsers;
    private Integer maxStorageGb;
    private String featuresEnabled;
    private String billingEmail;
    private String technicalContactEmail;
    private String address;
    private String phone;
    private String website;
    private Boolean setupCompleted;
    private Integer setupStep;
    private Integer userCount;
    private Double storageUsedGb;
    private Integer apiCallsMonthly;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
