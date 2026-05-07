package com.everx.platform.config.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOptionValueRequest {

    @NotBlank(message = "Value is required")
    private String value;

    @NotBlank(message = "Label is required")
    private String label;

    private String colorCode;

    @NotNull(message = "Sort order is required")
    private Integer sortOrder;

    private String description;
    private Boolean isActive;
    private Boolean isDefault;
}
