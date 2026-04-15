package com.everx.auth.dto;

import com.everx.auth.entity.User;
import com.fasterxml.jackson.annotation.JsonProperty;
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

    @JsonProperty("officeLocation")
    private String officeLocation;

    @JsonProperty("isActive")
    private Boolean isActive;

    @JsonProperty("lastLogin")
    private OffsetDateTime lastLogin;

    @JsonProperty("avatarUrl")
    private String avatarUrl;

    public static UserDto fromEntity(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .officeLocation(user.getOfficeLocation().name())
                .isActive(user.getIsActive())
                .lastLogin(user.getLastLogin())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
