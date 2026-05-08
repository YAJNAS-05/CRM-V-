package com.everx.tenant.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateTenantRequest {

    @Size(max = 200, message = "Company name must not exceed 200 characters")
    private String name;

    @Size(max = 100, message = "Industry must not exceed 100 characters")
    private String industry;

    private Integer companySize;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @Size(max = 500, message = "Logo URL must not exceed 500 characters")
    private String logoUrl;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Primary color must be a valid hex color")
    private String primaryColor;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Secondary color must be a valid hex color")
    private String secondaryColor;

    @Size(max = 50, message = "Timezone must not exceed 50 characters")
    private String timezone;

    @Pattern(regexp = "^[a-z]{2}_[A-Z]{2}$", message = "Locale must be in format en_US")
    private String locale;

    @Size(max = 3, message = "Currency must be a valid 3-letter code")
    private String currency;

    @Size(max = 20, message = "Date format must not exceed 20 characters")
    private String dateFormat;

    @Size(max = 10, message = "Time format must not exceed 10 characters")
    private String timeFormat;

    @Email(message = "Billing email must be valid")
    private String billingEmail;

    @Email(message = "Technical contact email must be valid")
    private String technicalContactEmail;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    @Size(max = 50, message = "Phone must not exceed 50 characters")
    private String phone;

    @Size(max = 200, message = "Website must not exceed 200 characters")
    private String website;

    @Size(max = 2000, message = "Notes must not exceed 2000 characters")
    private String notes;
}
