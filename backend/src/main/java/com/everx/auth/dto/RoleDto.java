package com.everx.auth.dto;

import com.everx.auth.entity.Role;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleDto {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("description")
    private String description;

    @JsonProperty("isSystem")
    private Boolean isSystem;

    @JsonProperty("isActive")
    private Boolean isActive;

    @JsonProperty("permissionKeys")
    private List<String> permissionKeys;

    @JsonProperty("permissions")
    private List<PermissionDto> permissions;

    public static RoleDto fromEntity(Role role) {
        List<PermissionDto> permissionDtos = role.getPermissions().stream()
                .map(PermissionDto::fromEntity)
                .sorted(Comparator.comparing(PermissionDto::getPermissionKey))
                .toList();

        List<String> permissionKeys = permissionDtos.stream()
                .map(PermissionDto::getPermissionKey)
                .toList();

        return RoleDto.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .isSystem(role.getIsSystem())
                .isActive(role.getIsActive())
                .permissionKeys(permissionKeys)
                .permissions(permissionDtos)
                .build();
    }
}
