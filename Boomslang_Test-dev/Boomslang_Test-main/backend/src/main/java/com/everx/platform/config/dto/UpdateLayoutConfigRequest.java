package com.everx.platform.config.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateLayoutConfigRequest {

    private String name;
    private String layoutJson;
    private String appliesToRoles;
    private Boolean isDefault;
    private Boolean isActive;
}
