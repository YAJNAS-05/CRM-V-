package com.everx.integration.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LinkDefinition {
    private String targetModule;
    private String targetEntity;
    private String linkField;
    private String displayName;
    private String icon;
}
