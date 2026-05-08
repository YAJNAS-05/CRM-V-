package com.everx.onboarding.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OnboardingStepDto {
    private int step;
    private String name;
    private String title;
    private String description;
    private int estimatedMinutes;
}
