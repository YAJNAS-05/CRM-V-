package com.everx.finance.account.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Update GL Account Request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateGlAccountRequest {

    @NotBlank(message = "Account name is required")
    @Size(max = 255, message = "Account name must be max 255 characters")
    private String accountName;

    @Size(max = 500, message = "Description max 500 characters")
    private String description;

    @NotNull(message = "Is active must be specified")
    private Boolean isActive;

    @NotNull(message = "Requires cost center must be specified")
    private Boolean requiresCostCenter;

    @NotNull(message = "Requires department must be specified")
    private Boolean requiresDepartment;

    @NotNull(message = "Allows manual entry must be specified")
    private Boolean allowsManualEntry;
}
