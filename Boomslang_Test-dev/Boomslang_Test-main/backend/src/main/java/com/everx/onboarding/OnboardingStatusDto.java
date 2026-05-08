package com.everx.onboarding.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class OnboardingStatusDto {
    private UUID tenantId;
    private String tenantName;
    private String subdomain;
    private int currentStep;
    private boolean isCompleted;
    private LocalDateTime trialEndDate;
    private String subscriptionPlan;
}
