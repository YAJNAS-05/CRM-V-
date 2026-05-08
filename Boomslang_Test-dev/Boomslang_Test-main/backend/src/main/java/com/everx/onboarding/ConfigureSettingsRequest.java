package com.everx.onboarding.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ConfigureSettingsRequest {

    @Size(max = 20, message = "Date format must not exceed 20 characters")
    private String dateFormat;

    @Size(max = 10, message = "Time format must not exceed 10 characters")
    private String timeFormat;

    @Size(max = 2000, message = "Additional notes must not exceed 2000 characters")
    private String additionalNotes;

    private Boolean enableEmailNotifications = true;

    private Boolean enableTwoFactorAuth = false;

    private String defaultLanguage = "en";
}
