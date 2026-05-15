package com.everx.auth.dto;

import com.everx.auth.entity.User;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("email")
    private String email;

    @JsonProperty("fullName")
    private String fullName;

    @JsonProperty("phone")
    private String phone;

    @JsonProperty("role")
    private String role;

    @JsonProperty("roles")
    private List<String> roles;

    @JsonProperty("permissions")
    private List<String> permissions;

    @JsonProperty("officeLocation")
    private String officeLocation;

    @JsonProperty("isActive")
    private Boolean isActive;

    @JsonProperty("lastLogin")
    private OffsetDateTime lastLogin;

    @JsonProperty("avatarUrl")
    private String avatarUrl;

    public static UserDto fromEntity(User user) {
        LinkedHashSet<String> roleNames = new LinkedHashSet<>();
        if (user.getAssignedRoles() != null) {
            user.getAssignedRoles().stream()
                .filter(role -> role != null
                    && Boolean.TRUE.equals(role.getIsActive())
                    && !Boolean.TRUE.equals(role.getIsDeleted()))
                .map(role -> role.getName())
                .sorted()
                .forEach(roleNames::add);
        }

        if (roleNames.isEmpty() && user.getRole() != null) {
            roleNames.add(user.getRole().name());
        }

        List<String> permissions = new ArrayList<>();
        if (user.getAssignedRoles() != null) {
            permissions = user.getAssignedRoles().stream()
                .filter(role -> role != null
                    && Boolean.TRUE.equals(role.getIsActive())
                    && !Boolean.TRUE.equals(role.getIsDeleted())
                    && role.getPermissions() != null)
                .flatMap(role -> role.getPermissions().stream())
                .filter(permission -> permission != null
                    && Boolean.TRUE.equals(permission.getIsActive())
                    && !Boolean.TRUE.equals(permission.getIsDeleted()))
                .map(permission -> permission.getPermissionKey())
                .distinct()
                .sorted(Comparator.naturalOrder())
                .toList();
        }

        String primaryRole = user.getRole() != null
            ? user.getRole().name()
            : roleNames.stream().findFirst().orElse(null);

        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
            .role(primaryRole)
            .roles(roleNames.stream().toList())
            .permissions(permissions)
                .officeLocation(user.getOfficeLocation().name())
                .isActive(user.getIsActive())
                .lastLogin(user.getLastLogin())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
