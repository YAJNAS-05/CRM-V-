package com.everx.auth.controller;

import com.everx.auth.dto.CreateRoleRequest;
import com.everx.auth.dto.PermissionDto;
import com.everx.auth.dto.RoleDto;
import com.everx.auth.dto.UpdateRolePermissionsRequest;
import com.everx.auth.dto.UpdateRoleRequest;
import com.everx.auth.service.RoleService;
import com.everx.shared.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/roles")
@Validated
@Slf4j
public class RoleController {

    @Autowired
    private RoleService roleService;

    /**
     * Get all available roles
     */
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    public ResponseEntity<ApiResponse<List<RoleDto>>> getAllRoles() {
        log.info("GET /api/v1/admin/roles");
        List<RoleDto> roles = roleService.getAllRoles();
        return ResponseEntity.ok(ApiResponse.ok(roles, "Roles retrieved successfully"));
    }

    /**
     * Get all available permissions
     */
    @GetMapping("/permissions")
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    public ResponseEntity<ApiResponse<List<PermissionDto>>> getAllPermissions() {
        log.info("GET /api/v1/admin/roles/permissions");
        List<PermissionDto> permissions = roleService.getAllPermissions();
        return ResponseEntity.ok(ApiResponse.ok(permissions, "Permissions retrieved successfully"));
    }

    /**
     * Create custom role
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_CREATE')")
    public ResponseEntity<ApiResponse<RoleDto>> createRole(@Valid @RequestBody @NonNull CreateRoleRequest request) {
        log.info("POST /api/v1/admin/roles - name: {}", request.getName());
        RoleDto role = roleService.createRole(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(role, "Role created successfully"));
    }

    /**
     * Update role metadata
     */
    @PutMapping("/{roleId}")
    @PreAuthorize("hasAuthority('ROLE_EDIT')")
    public ResponseEntity<ApiResponse<RoleDto>> updateRole(
            @PathVariable @NonNull UUID roleId,
            @Valid @RequestBody @NonNull UpdateRoleRequest request) {
        log.info("PUT /api/v1/admin/roles/{}", roleId);
        RoleDto role = roleService.updateRole(roleId, request);
        return ResponseEntity.ok(ApiResponse.ok(role, "Role updated successfully"));
    }

    /**
     * Replace role permissions
     */
    @PutMapping("/{roleId}/permissions")
    @PreAuthorize("hasAuthority('ROLE_ASSIGN_PERMISSION')")
    public ResponseEntity<ApiResponse<RoleDto>> updateRolePermissions(
            @PathVariable @NonNull UUID roleId,
            @Valid @RequestBody @NonNull UpdateRolePermissionsRequest request) {
        log.info("PUT /api/v1/admin/roles/{}/permissions", roleId);
        RoleDto role = roleService.updateRolePermissions(roleId, request.getPermissionKeys());
        return ResponseEntity.ok(ApiResponse.ok(role, "Role permissions updated successfully"));
    }

    /**
     * Delete role
     */
    @DeleteMapping("/{roleId}")
    @PreAuthorize("hasAuthority('ROLE_DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteRole(@PathVariable @NonNull UUID roleId) {
        log.info("DELETE /api/v1/admin/roles/{}", roleId);
        roleService.deleteRole(roleId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Role deleted successfully"));
    }

    /**
     * Get all available office locations
     */
    @GetMapping("/locations")
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllLocations() {
        log.info("GET /api/v1/admin/roles/locations");
        List<Map<String, Object>> locations = roleService.getAllOfficeLocations();
        return ResponseEntity.ok(ApiResponse.ok(locations, "Locations retrieved successfully"));
    }
}
