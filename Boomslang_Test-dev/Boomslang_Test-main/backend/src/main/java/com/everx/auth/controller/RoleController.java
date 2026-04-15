package com.everx.auth.controller;

import com.everx.auth.service.RoleService;
import com.everx.shared.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/roles")
@Slf4j
public class RoleController {

    @Autowired
    private RoleService roleService;

    /**
     * Get all available roles
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_MANAGER')")
    public ResponseEntity<ApiResponse<List<Map<String, ?>>>> getAllRoles() {
        log.info("GET /api/v1/admin/roles");
        List<Map<String, ?>> roles = roleService.getAllRoles();
        return ResponseEntity.ok(ApiResponse.ok(roles, "Roles retrieved successfully"));
    }

    /**
     * Get all available office locations
     */
    @GetMapping("/locations")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES_MANAGER')")
    public ResponseEntity<ApiResponse<List<Map<String, ?>>>> getAllLocations() {
        log.info("GET /api/v1/admin/roles/locations");
        List<Map<String, ?>> locations = roleService.getAllOfficeLocations();
        return ResponseEntity.ok(ApiResponse.ok(locations, "Locations retrieved successfully"));
    }
}
