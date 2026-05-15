package com.everx.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateRoleRequest {

    @NotBlank(message = "Role name is required")
    private String name;

    private String description;

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private List<String> permissionKeys = List.of();
}
