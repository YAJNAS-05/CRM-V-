package com.everx.tenant.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class UpdateSubscriptionRequest {

    @NotBlank(message = "Subscription plan is required")
    private String plan;

    @NotNull(message = "Max users is required")
    @Min(value = 1, message = "Max users must be at least 1")
    private Integer maxUsers;

    @NotNull(message = "Max storage is required")
    @Min(value = 1, message = "Max storage must be at least 1 GB")
    private Integer maxStorageGb;

    private List<String> features;

    private LocalDateTime trialEndDate;
}
