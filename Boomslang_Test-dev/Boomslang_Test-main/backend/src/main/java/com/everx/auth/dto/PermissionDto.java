package com.everx.auth.dto;

import com.everx.auth.entity.Permission;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermissionDto {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("permissionKey")
    private String permissionKey;

    @JsonProperty("module")
    private String module;

    @JsonProperty("action")
    private String action;

    @JsonProperty("description")
    private String description;

    @JsonProperty("isActive")
    private Boolean isActive;

    public static PermissionDto fromEntity(Permission permission) {
        return PermissionDto.builder()
                .id(permission.getId())
                .permissionKey(permission.getPermissionKey())
                .module(permission.getModule())
                .action(permission.getAction())
                .description(permission.getDescription())
                .isActive(permission.getIsActive())
                .build();
    }
}
