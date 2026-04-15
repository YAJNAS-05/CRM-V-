package com.everx.auth.service;

import com.everx.auth.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class RoleService {

    /**
     * Get all available roles
     */
    public List<Map<String, ?>> getAllRoles() {
        log.info("Fetching all available roles");
        return Arrays.stream(User.UserRole.values())
                .map(role -> {
                    Map<String, Object> roleMap = new HashMap<>();
                    roleMap.put("name", role.name());
                    roleMap.put("description", getRoleDescription(role));
                    return roleMap;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get all available office locations
     */
    public List<Map<String, ?>> getAllOfficeLocations() {
        log.info("Fetching all available office locations");
        return Arrays.stream(User.OfficeLocation.values())
                .map(location -> {
                    Map<String, Object> locMap = new HashMap<>();
                    locMap.put("name", location.name());
                    locMap.put("code", getLocationCode(location));
                    return locMap;
                })
                .collect(Collectors.toList());
    }

    /**
     * Check if user can manage a role
     */
    public boolean canManageRole(User.UserRole currentUserRole, User.UserRole targetRole) {
        // Only ADMIN can manage any role
        return currentUserRole == User.UserRole.ADMIN;
    }

    private String getRoleDescription(User.UserRole role) {
        return switch (role) {
            case ADMIN -> "Full system access, user management, configuration";
            case SUPER_ADMIN -> "Super administrator with unrestricted access";
            case MANAGER -> "Team management and oversight";
            case SALES_MANAGER -> "Manage sales team, deals, quotes, reports";
            case SALES_REP -> "Create and manage leads, deals, quotes";
            case SERVICE_TECH -> "Manage equipment, service tickets, maintenance";
            case FINANCE -> "Manage invoices, payments, financial reports";
            case READ_ONLY -> "View-only access to all data";
            case VIEWER -> "View-only access to assigned data";
        };
    }

    private String getLocationCode(User.OfficeLocation location) {
        return switch (location) {
            case AUSTRALIA -> "AU";
            case USA -> "US";
            case JAPAN -> "JP";
        };
    }
}
