package com.everx.auth.service;

import com.everx.auth.dto.CreateRoleRequest;
import com.everx.auth.dto.PermissionDto;
import com.everx.auth.dto.RoleDto;
import com.everx.auth.dto.UpdateRoleRequest;
import com.everx.auth.entity.User;
import com.everx.auth.entity.Permission;
import com.everx.auth.entity.Role;
import com.everx.auth.repository.PermissionRepository;
import com.everx.auth.repository.RoleRepository;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
@Slf4j
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    /**
     * Get all available roles
     */
    public List<RoleDto> getAllRoles() {
        log.info("Fetching all available roles");
        return roleRepository.findAllActiveWithPermissions().stream()
                .map(RoleDto::fromEntity)
                .toList();
    }

    /**
     * Get all available permissions
     */
    public List<PermissionDto> getAllPermissions() {
        log.info("Fetching all available permissions");
        ensureDashboardPermissions();
        return permissionRepository.findAllActive().stream()
                .map(PermissionDto::fromEntity)
                .toList();
    }

    /**
     * Create a new custom role
     */
    public RoleDto createRole(CreateRoleRequest request) {
        String roleName = normalizeRoleName(request.getName());
        log.info("Creating role: {}", roleName);

        if (roleRepository.existsActiveByName(roleName)) {
            throw new ValidationException("name", "Role already exists: " + roleName);
        }

        Role role = Role.builder()
                .name(roleName)
                .description(request.getDescription())
                .isSystem(false)
                .isActive(request.getIsActive() == null || request.getIsActive())
                .permissions(resolvePermissions(request.getPermissionKeys()))
                .build();

        Role savedRole = roleRepository.save(java.util.Objects.requireNonNull(role));
        return RoleDto.fromEntity(savedRole);
    }

    /**
     * Update role metadata
     */
    public RoleDto updateRole(UUID roleId, UpdateRoleRequest request) {
        Role role = roleRepository.findByIdWithPermissions(roleId)
                .orElseThrow(() -> new EntityNotFoundException("Role not found with id: " + roleId));

        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }

        if (request.getIsActive() != null) {
            role.setIsActive(request.getIsActive());
        }

        Role savedRole = roleRepository.save(java.util.Objects.requireNonNull(role));
        return RoleDto.fromEntity(savedRole);
    }

    /**
     * Replace role permissions
     */
    public RoleDto updateRolePermissions(UUID roleId, List<String> permissionKeys) {
        Role role = roleRepository.findByIdWithPermissions(roleId)
                .orElseThrow(() -> new EntityNotFoundException("Role not found with id: " + roleId));

        role.setPermissions(resolvePermissions(permissionKeys));
        return RoleDto.fromEntity(roleRepository.save(role));
    }

    /**
     * Soft delete/deactivate role
     */
    public void deleteRole(UUID roleId) {
        Role role = roleRepository.findByIdWithPermissions(roleId)
                .orElseThrow(() -> new EntityNotFoundException("Role not found with id: " + roleId));

        if (Boolean.TRUE.equals(role.getIsSystem())) {
            throw new ValidationException("role", "System roles cannot be deleted");
        }

        role.setIsActive(false);
        role.setIsDeleted(true);
        roleRepository.save(role);
    }

    /**
     * Get all available office locations
     */
    public List<java.util.Map<String, Object>> getAllOfficeLocations() {
        log.info("Fetching all available office locations");
        return java.util.Arrays.stream(User.OfficeLocation.values())
                .map(location -> {
                    java.util.Map<String, Object> locMap = new java.util.HashMap<>();
                    locMap.put("name", location.name());
                    locMap.put("code", getLocationCode(location));
                    return locMap;
                })
                .toList();
    }

    /**
     * Check if user can manage a role
     */
    public boolean canManageRole(User.UserRole currentUserRole, User.UserRole targetRole) {
        // Only ADMIN can manage any role
        return currentUserRole == User.UserRole.ADMIN;
    }

    private Set<Permission> resolvePermissions(Collection<String> permissionKeys) {
        if (permissionKeys == null || permissionKeys.isEmpty()) {
            return new LinkedHashSet<>();
        }

        Set<String> normalizedKeys = permissionKeys.stream()
                .filter(java.util.Objects::nonNull)
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .map(String::toUpperCase)
                .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));

        List<Permission> permissions = permissionRepository.findActiveByKeys(normalizedKeys);
        Set<String> matchedKeys = permissions.stream()
                .map(Permission::getPermissionKey)
                .collect(java.util.stream.Collectors.toSet());

        List<String> missingKeys = new ArrayList<>();
        for (String key : normalizedKeys) {
            if (!matchedKeys.contains(key)) {
                missingKeys.add(key);
            }
        }

        if (!missingKeys.isEmpty()) {
            throw new ValidationException("permissionKeys", "Unknown permissions: " + String.join(", ", missingKeys));
        }

        return new LinkedHashSet<>(permissions);
    }

    private String normalizeRoleName(String roleName) {
        if (roleName == null || roleName.trim().isEmpty()) {
            throw new ValidationException("name", "Role name is required");
        }
        return roleName.trim().toUpperCase();
    }

    private void ensureDashboardPermissions() {
        upsertPermission("DASHBOARD_SELF_VIEW", "CRM", "SELF_VIEW", "View CRM user dashboard");
        upsertPermission("DASHBOARD_TEAM_VIEW", "CRM", "TEAM_VIEW", "View CRM team dashboard");
    }

    private void upsertPermission(String key, String module, String action, String description) {
        Permission permission = permissionRepository.findByPermissionKey(key).orElseGet(Permission::new);
        boolean shouldSave = permission.getId() == null;

        if (!key.equals(permission.getPermissionKey())) {
            permission.setPermissionKey(key);
            shouldSave = true;
        }

        if (!module.equals(permission.getModule())) {
            permission.setModule(module);
            shouldSave = true;
        }

        if (!action.equals(permission.getAction())) {
            permission.setAction(action);
            shouldSave = true;
        }

        if (!description.equals(permission.getDescription())) {
            permission.setDescription(description);
            shouldSave = true;
        }

        if (permission.getIsActive() == null || !permission.getIsActive()) {
            permission.setIsActive(true);
            shouldSave = true;
        }

        if (Boolean.TRUE.equals(permission.getIsDeleted())) {
            permission.setIsDeleted(false);
            shouldSave = true;
        }

        if (shouldSave) {
            permissionRepository.save(permission);
        }
    }

    private String getLocationCode(User.OfficeLocation location) {
        return switch (location) {
            case AUSTRALIA -> "AU";
            case USA -> "US";
            case JAPAN -> "JP";
        };
    }
}
