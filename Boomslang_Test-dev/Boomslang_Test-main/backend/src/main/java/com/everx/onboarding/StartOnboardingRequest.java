package com.everx.onboarding.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class StartOnboardingRequest {

    @NotBlank(message = "Company name is required")
    @Size(max = 200, message = "Company name must not exceed 200 characters")
    private String companyName;

    @NotBlank(message = "Subdomain is required")
    @Pattern(regexp = "^[a-z0-9][a-z0-9-]*[a-z0-9]$", 
             message = "Subdomain must contain only lowercase letters, numbers, and hyphens")
    @Size(min = 3, max = 50, message = "Subdomain must be between 3 and 50 characters")
    private String subdomain;

    @Size(max = 100, message = "Industry must not exceed 100 characters")
    private String industry;

    private Integer companySize;

    @Email(message = "Billing email must be valid")
    private String billingEmail;

    @Email(message = "Technical contact email must be valid")
    private String technicalContactEmail;
}
