package com.everx.onboarding.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class OnboardingResponseDto {
    private UUID tenantId;
    private String subdomain;
    private int step;
    private String message;
    private String nextStep;
    private Map<String, Integer> importResults;
}
