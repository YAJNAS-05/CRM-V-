package com.everx.platform.config.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateOptionValueRequest {

    private String label;
    private String colorCode;
    private Integer sortOrder;
    private String description;
    private Boolean isActive;
    private Boolean isDefault;
}
