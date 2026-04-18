package com.everx.config;

import com.everx.auth.entity.Permission;
import com.everx.auth.entity.Role;
import com.everx.auth.entity.User;
import com.everx.auth.repository.PermissionRepository;
import com.everx.auth.repository.RoleRepository;
import com.everx.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class RbacDataInitializer implements ApplicationRunner {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedPermissions();
        Map<String, Role> systemRoles = seedSystemRoles();
        syncUsersWithPrimaryRole(systemRoles);
    }

    private void seedPermissions() {
        List<PermissionSeed> seeds = List.of(
                new PermissionSeed("USER_VIEW", "USER", "VIEW", "View users"),
                new PermissionSeed("USER_CREATE", "USER", "CREATE", "Create users"),
                new PermissionSeed("USER_EDIT", "USER", "EDIT", "Edit users"),
                new PermissionSeed("USER_DELETE", "USER", "DELETE", "Delete users"),
                new PermissionSeed("USER_ASSIGN_ROLE", "USER", "ASSIGN_ROLE", "Assign roles to users"),

                new PermissionSeed("ROLE_VIEW", "ROLE", "VIEW", "View roles"),
                new PermissionSeed("ROLE_CREATE", "ROLE", "CREATE", "Create roles"),
                new PermissionSeed("ROLE_EDIT", "ROLE", "EDIT", "Edit roles"),
                new PermissionSeed("ROLE_DELETE", "ROLE", "DELETE", "Delete roles"),
                new PermissionSeed("ROLE_ASSIGN_PERMISSION", "ROLE", "ASSIGN_PERMISSION", "Assign permissions to roles"),

                new PermissionSeed("CRM_VIEW", "CRM", "VIEW", "View CRM data"),
                new PermissionSeed("CRM_CREATE", "CRM", "CREATE", "Create CRM records"),
                new PermissionSeed("CRM_EDIT", "CRM", "EDIT", "Edit CRM records"),
                new PermissionSeed("CRM_DELETE", "CRM", "DELETE", "Delete CRM records"),

                new PermissionSeed("ERP_VIEW", "ERP", "VIEW", "View ERP data"),
                new PermissionSeed("ERP_CREATE", "ERP", "CREATE", "Create ERP records"),
                new PermissionSeed("ERP_EDIT", "ERP", "EDIT", "Edit ERP records"),
                new PermissionSeed("ERP_DELETE", "ERP", "DELETE", "Delete ERP records"),

                new PermissionSeed("FINANCE_VIEW", "FINANCE", "VIEW", "View finance module"),
                new PermissionSeed("FINANCE_CREATE", "FINANCE", "CREATE", "Create finance records"),
                new PermissionSeed("FINANCE_EDIT", "FINANCE", "EDIT", "Edit finance records"),
                new PermissionSeed("FINANCE_DELETE", "FINANCE", "DELETE", "Delete finance records"),

                new PermissionSeed("FIELDWORK_VIEW", "FIELDWORK", "VIEW", "View field work"),
                new PermissionSeed("FIELDWORK_CREATE", "FIELDWORK", "CREATE", "Create field work"),
                new PermissionSeed("FIELDWORK_EDIT", "FIELDWORK", "EDIT", "Edit field work"),

                new PermissionSeed("REPORT_VIEW", "REPORT", "VIEW", "View reports"),
                new PermissionSeed("REPORT_EXPORT", "REPORT", "EXPORT", "Export reports"),

                new PermissionSeed("DASHBOARD_VIEW", "CRM", "VIEW", "View CRM dashboard"),
                new PermissionSeed("DASHBOARD_SELF_VIEW", "CRM", "SELF_VIEW", "View CRM user dashboard"),
                new PermissionSeed("DASHBOARD_TEAM_VIEW", "CRM", "TEAM_VIEW", "View CRM team dashboard")
        );

        for (PermissionSeed seed : seeds) {
            Permission permission = permissionRepository.findByPermissionKey(seed.key()).orElseGet(Permission::new);
            permission.setPermissionKey(seed.key());
            permission.setModule(seed.module());
            permission.setAction(seed.action());
            permission.setDescription(seed.description());
            permission.setIsActive(true);
            permission.setIsDeleted(false);
            permissionRepository.save(permission);
        }

        deactivateDeprecatedPermissions(Set.of("AUDIT_VIEW", "ERP_MAPPING_VIEW", "ERP_MAPPING_EDIT"));

        log.info("RBAC permissions seeded/verified: {}", seeds.size());
    }

    private void deactivateDeprecatedPermissions(Set<String> deprecatedKeys) {
        int deactivatedCount = 0;

        for (String key : deprecatedKeys) {
            Permission permission = permissionRepository.findByPermissionKey(key).orElse(null);
            if (permission == null) {
                continue;
            }

            boolean changed = false;
            if (Boolean.TRUE.equals(permission.getIsActive())) {
                permission.setIsActive(false);
                changed = true;
            }

            if (Boolean.FALSE.equals(permission.getIsDeleted())) {
                permission.setIsDeleted(true);
                changed = true;
            }

            if (changed) {
                permissionRepository.save(permission);
                deactivatedCount++;
            }
        }

        if (deactivatedCount > 0) {
            log.info("RBAC deprecated permissions deactivated: {}", deactivatedCount);
        }
    }

    private Map<String, Role> seedSystemRoles() {
        List<Permission> allPermissions = permissionRepository.findAllActive();
        Map<String, Permission> permissionByKey = new HashMap<>();
        for (Permission permission : allPermissions) {
            permissionByKey.put(permission.getPermissionKey(), permission);
        }

        Map<String, Set<String>> rolePermissionMatrix = defaultRolePermissionMatrix();
        Map<String, String> roleDescriptions = defaultRoleDescriptions();
        Map<String, Role> systemRoles = new HashMap<>();

        for (User.UserRole roleEnum : User.UserRole.values()) {
            String roleName = roleEnum.name();
            Role role = roleRepository.findByNameWithPermissions(roleName).orElseGet(Role::new);

            role.setName(roleName);
            role.setDescription(roleDescriptions.getOrDefault(roleName, roleName + " system role"));
            role.setIsSystem(true);
            role.setIsActive(true);
            role.setIsDeleted(false);

            Set<String> permissionKeys = rolePermissionMatrix.getOrDefault(roleName, Set.of());
            Set<Permission> mappedPermissions = new LinkedHashSet<>();
            for (String key : permissionKeys) {
                Permission permission = permissionByKey.get(key);
                if (permission != null) {
                    mappedPermissions.add(permission);
                }
            }
            role.setPermissions(mappedPermissions);

            Role savedRole = roleRepository.save(role);
            systemRoles.put(savedRole.getName(), savedRole);
        }

        log.info("RBAC system roles seeded/verified: {}", systemRoles.size());
        return systemRoles;
    }

    private void syncUsersWithPrimaryRole(Map<String, Role> systemRoles) {
        List<User> users = userRepository.findAll();
        int updatedUsers = 0;

        for (User user : users) {
            if (Boolean.TRUE.equals(user.getIsDeleted()) || user.getRole() == null) {
                continue;
            }

            Role primaryRole = systemRoles.get(user.getRole().name());
            if (primaryRole == null) {
                continue;
            }

            Set<Role> assignedRoles = user.getAssignedRoles();
            if (assignedRoles == null) {
                assignedRoles = new HashSet<>();
            }

            if (assignedRoles.stream().noneMatch(role -> role.getName().equals(primaryRole.getName()))) {
                assignedRoles.add(primaryRole);
                user.setAssignedRoles(assignedRoles);
                userRepository.save(user);
                updatedUsers++;
            }
        }

        if (updatedUsers > 0) {
            log.info("RBAC user-role assignments synchronized: {} users updated", updatedUsers);
        }
    }

    private Map<String, Set<String>> defaultRolePermissionMatrix() {
        Set<String> all = new LinkedHashSet<>();
        for (Permission permission : permissionRepository.findAllActive()) {
            all.add(permission.getPermissionKey());
        }

        Set<String> viewerSet = Set.of(
            "CRM_VIEW", "ERP_VIEW", "FINANCE_VIEW", "FIELDWORK_VIEW", "REPORT_VIEW", "DASHBOARD_SELF_VIEW"
        );

        Map<String, Set<String>> matrix = new LinkedHashMap<>();
        matrix.put(User.UserRole.SUPER_ADMIN.name(), all);
        matrix.put(User.UserRole.ADMIN.name(), all);
        matrix.put(User.UserRole.MANAGER.name(), Set.of(
            "CRM_VIEW", "CRM_EDIT", "ERP_VIEW", "FINANCE_VIEW", "REPORT_VIEW", "REPORT_EXPORT", "DASHBOARD_SELF_VIEW", "DASHBOARD_TEAM_VIEW"
        ));
        matrix.put(User.UserRole.SALES_MANAGER.name(), Set.of(
            "CRM_VIEW", "CRM_CREATE", "CRM_EDIT", "REPORT_VIEW", "REPORT_EXPORT", "DASHBOARD_SELF_VIEW", "DASHBOARD_TEAM_VIEW"
        ));
        matrix.put(User.UserRole.SALES_REP.name(), Set.of(
            "CRM_VIEW", "CRM_CREATE", "CRM_EDIT", "DASHBOARD_SELF_VIEW"
        ));
        matrix.put(User.UserRole.FINANCE.name(), Set.of(
            "FINANCE_VIEW", "FINANCE_CREATE", "FINANCE_EDIT", "REPORT_VIEW", "REPORT_EXPORT", "DASHBOARD_SELF_VIEW"
        ));
        matrix.put(User.UserRole.SERVICE_TECH.name(), Set.of(
            "ERP_VIEW", "ERP_EDIT", "FIELDWORK_VIEW", "FIELDWORK_CREATE", "FIELDWORK_EDIT"
        ));
        matrix.put(User.UserRole.VIEWER.name(), viewerSet);
        matrix.put(User.UserRole.READ_ONLY.name(), viewerSet);
        return matrix;
    }

    private Map<String, String> defaultRoleDescriptions() {
        Map<String, String> descriptions = new HashMap<>();
        descriptions.put(User.UserRole.SUPER_ADMIN.name(), "Super administrator with unrestricted access");
        descriptions.put(User.UserRole.ADMIN.name(), "Full system access, user and role administration");
        descriptions.put(User.UserRole.MANAGER.name(), "Operational manager with cross-module oversight");
        descriptions.put(User.UserRole.SALES_MANAGER.name(), "Sales leadership access");
        descriptions.put(User.UserRole.SALES_REP.name(), "Sales execution access");
        descriptions.put(User.UserRole.FINANCE.name(), "Finance operations and reporting");
        descriptions.put(User.UserRole.SERVICE_TECH.name(), "Service, ERP and field work access");
        descriptions.put(User.UserRole.VIEWER.name(), "Read-only operational access");
        descriptions.put(User.UserRole.READ_ONLY.name(), "Minimal read-only access");
        return descriptions;
    }

    private record PermissionSeed(String key, String module, String action, String description) {
    }
}
