package com.everx.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateRolePermissionsRequest {

    @Builder.Default
    private List<String> permissionKeys = List.of();
}
