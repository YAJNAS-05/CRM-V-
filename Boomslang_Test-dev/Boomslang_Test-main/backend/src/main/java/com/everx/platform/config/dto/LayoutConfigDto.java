package com.everx.platform.config.dto;

import com.everx.platform.config.entity.LayoutConfig;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LayoutConfigDto {

    private UUID id;
    private String module;
    private String entity;
    private String name;
    private String layoutJson;
    private String status;
    private Integer versionNumber;
    private String appliesToRoles;
    private OffsetDateTime publishedAt;
    private UUID publishedBy;
    private Boolean isDefault;
    private Boolean isActive;

    public static LayoutConfigDto fromEntity(LayoutConfig config) {
        return LayoutConfigDto.builder()
                .id(config.getId())
                .module(config.getModule())
                .entity(config.getEntity())
                .name(config.getName())
                .layoutJson(config.getLayoutJson())
                .status(config.getStatus())
                .versionNumber(config.getVersionNumber())
                .appliesToRoles(config.getAppliesToRoles())
                .publishedAt(config.getPublishedAt())
                .publishedBy(config.getPublishedBy())
                .isDefault(config.getIsDefault())
                .isActive(config.getIsActive())
                .build();
    }
}
