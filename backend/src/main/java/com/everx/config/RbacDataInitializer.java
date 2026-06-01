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

                new PermissionSeed("HR_VIEW", "HR", "VIEW", "View HR module"),
                new PermissionSeed("HR_CREATE", "HR", "CREATE", "Create HR records"),
                new PermissionSeed("HR_EDIT", "HR", "EDIT", "Edit HR records"),
                new PermissionSeed("HR_DELETE", "HR", "DELETE", "Delete HR records"),

                new PermissionSeed("HR_EMPLOYEE_VIEW", "HR", "VIEW", "View employees"),
                new PermissionSeed("HR_EMPLOYEE_CREATE", "HR", "CREATE", "Create employees"),
                new PermissionSeed("HR_EMPLOYEE_EDIT", "HR", "EDIT", "Edit employees"),
                new PermissionSeed("HR_EMPLOYEE_DELETE", "HR", "DELETE", "Delete employees"),

                new PermissionSeed("HR_DEPARTMENT_VIEW", "HR", "VIEW", "View departments"),
                new PermissionSeed("HR_DEPARTMENT_CREATE", "HR", "CREATE", "Create departments"),
                new PermissionSeed("HR_DEPARTMENT_EDIT", "HR", "EDIT", "Edit departments"),
                new PermissionSeed("HR_DEPARTMENT_DELETE", "HR", "DELETE", "Delete departments"),

                new PermissionSeed("HR_POSITION_VIEW", "HR", "VIEW", "View positions"),
                new PermissionSeed("HR_POSITION_CREATE", "HR", "CREATE", "Create positions"),
                new PermissionSeed("HR_POSITION_EDIT", "HR", "EDIT", "Edit positions"),
                new PermissionSeed("HR_POSITION_DELETE", "HR", "DELETE", "Delete positions"),

                new PermissionSeed("HR_LEAVE_REQUEST_VIEW", "HR", "VIEW", "View leave requests"),
                new PermissionSeed("HR_LEAVE_REQUEST_CREATE", "HR", "CREATE", "Create leave requests"),
                new PermissionSeed("HR_LEAVE_REQUEST_APPROVE", "HR", "APPROVE", "Approve leave requests"),

                new PermissionSeed("HR_TIMESHEET_VIEW", "HR", "VIEW", "View timesheets"),
                new PermissionSeed("HR_TIMESHEET_CREATE", "HR", "CREATE", "Create timesheets"),
                new PermissionSeed("HR_TIMESHEET_APPROVE", "HR", "APPROVE", "Approve timesheets"),

                new PermissionSeed("HR_REIMBURSEMENT_VIEW", "HR", "VIEW", "View reimbursements"),
                new PermissionSeed("HR_REIMBURSEMENT_CREATE", "HR", "CREATE", "Create reimbursements"),
                new PermissionSeed("HR_REIMBURSEMENT_APPROVE", "HR", "APPROVE", "Approve reimbursements"),

                new PermissionSeed("HR_PAYROLL_RUN_VIEW", "HR", "VIEW", "View payroll runs"),
                new PermissionSeed("HR_PAYROLL_RUN_CREATE", "HR", "CREATE", "Create payroll runs"),
                new PermissionSeed("HR_PAYROLL_RUN_EDIT", "HR", "EDIT", "Edit payroll runs"),
                new PermissionSeed("HR_PAYROLL_RUN_DELETE", "HR", "DELETE", "Delete payroll runs"),

                new PermissionSeed("HR_PAYROLL_PROFILE_VIEW", "HR", "VIEW", "View payroll profiles"),
                new PermissionSeed("HR_PAYROLL_PROFILE_CREATE", "HR", "CREATE", "Create payroll profiles"),
                new PermissionSeed("HR_PAYROLL_PROFILE_EDIT", "HR", "EDIT", "Edit payroll profiles"),
                new PermissionSeed("HR_PAYROLL_PROFILE_DELETE", "HR", "DELETE", "Delete payroll profiles"),

                new PermissionSeed("FIELDWORK_VIEW", "FIELDWORK", "VIEW", "View field work"),
                new PermissionSeed("FIELDWORK_CREATE", "FIELDWORK", "CREATE", "Create field work"),
                new PermissionSeed("FIELDWORK_EDIT", "FIELDWORK", "EDIT", "Edit field work"),

                new PermissionSeed("REPORT_VIEW", "REPORT", "VIEW", "View reports"),
                new PermissionSeed("REPORT_EXPORT", "REPORT", "EXPORT", "Export reports"),

                new PermissionSeed("INSIGHTS_VIEW", "INSIGHTS", "VIEW", "View personal insights"),

                new PermissionSeed("DASHBOARD_VIEW", "CRM", "VIEW", "View CRM dashboard"),
                new PermissionSeed("DASHBOARD_SELF_VIEW", "CRM", "SELF_VIEW", "View CRM user dashboard"),
                new PermissionSeed("DASHBOARD_TEAM_VIEW", "CRM", "TEAM_VIEW", "View CRM team dashboard"),
                new PermissionSeed("DASHBOARD_FINANCE_VIEW", "DASHBOARD", "FINANCE_VIEW", "View finance dashboard"),
                new PermissionSeed("DASHBOARD_HR_VIEW", "DASHBOARD", "HR_VIEW", "View HR dashboard"),
                new PermissionSeed("DASHBOARD_TECH_VIEW", "DASHBOARD", "TECH_VIEW", "View technician dashboard"),
                new PermissionSeed("DASHBOARD_OPERATIONS_VIEW", "DASHBOARD", "OPS_VIEW", "View operations dashboard"),

                new PermissionSeed("REPORT_TEAM_VIEW", "REPORT", "TEAM_VIEW", "View team reports"),
                new PermissionSeed("REPORT_PERSONAL_VIEW", "REPORT", "PERSONAL_VIEW", "View personal reports"),

                new PermissionSeed("DATA_SCOPE_OWN", "DATA", "SCOPE_OWN", "Access own data only"),
                new PermissionSeed("DATA_SCOPE_TEAM", "DATA", "SCOPE_TEAM", "Access team data"),
                new PermissionSeed("DATA_SCOPE_ORG", "DATA", "SCOPE_ORG", "Access org data"),

                new PermissionSeed("HR_TRAINING_VIEW", "HR", "TRAINING_VIEW", "View training sessions"),
                new PermissionSeed("HR_TRAINING_CREATE", "HR", "TRAINING_CREATE", "Create training sessions"),
                new PermissionSeed("HR_TRAINING_EDIT", "HR", "TRAINING_EDIT", "Edit training sessions"),
                new PermissionSeed("HR_TRAINING_DELETE", "HR", "TRAINING_DELETE", "Delete training sessions"),
                new PermissionSeed("HR_TRAINING_ENROLL", "HR", "TRAINING_ENROLL", "Enroll in training sessions"),

                new PermissionSeed("HR_DOCUMENT_VIEW", "HR", "DOCUMENT_VIEW", "View HR documents"),
                new PermissionSeed("HR_DOCUMENT_CREATE", "HR", "DOCUMENT_CREATE", "Upload HR documents"),
                new PermissionSeed("HR_DOCUMENT_DELETE", "HR", "DOCUMENT_DELETE", "Delete HR documents"),
                new PermissionSeed("HR_DOCUMENT_VERIFY", "HR", "DOCUMENT_VERIFY", "Verify HR documents"),

                new PermissionSeed("HR_PAYSLIP_VIEW", "HR", "PAYSLIP_VIEW", "View payslips"),
                new PermissionSeed("HR_PAYSLIP_CREATE", "HR", "PAYSLIP_CREATE", "Generate payslips"),

                new PermissionSeed("HR_OFFER_VIEW", "HR", "OFFER_VIEW", "View offer letters"),
                new PermissionSeed("HR_OFFER_CREATE", "HR", "OFFER_CREATE", "Create offer letters"),
                new PermissionSeed("HR_OFFER_EDIT", "HR", "OFFER_EDIT", "Edit offer letters"),

                new PermissionSeed("HR_APPRAISAL_VIEW", "HR", "APPRAISAL_VIEW", "View performance appraisals"),
                new PermissionSeed("HR_APPRAISAL_CREATE", "HR", "APPRAISAL_CREATE", "Create performance appraisals"),
                new PermissionSeed("HR_APPRAISAL_EDIT", "HR", "APPRAISAL_EDIT", "Edit performance appraisals"),

                new PermissionSeed("PM_VIEW", "PM", "VIEW", "View PM projects and tasks"),
                new PermissionSeed("PM_CREATE", "PM", "CREATE", "Create PM projects and tasks"),
                new PermissionSeed("PM_EDIT", "PM", "EDIT", "Edit PM projects and tasks"),
                new PermissionSeed("PM_DELETE", "PM", "DELETE", "Delete PM projects and tasks")
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
            "CRM_VIEW",
            "ERP_VIEW",
            "FINANCE_VIEW",
            "FIELDWORK_VIEW",
            "PM_VIEW",
            "REPORT_VIEW",
            "REPORT_PERSONAL_VIEW",
            "DASHBOARD_SELF_VIEW",
            "INSIGHTS_VIEW",
            "DATA_SCOPE_OWN"
        );

        Map<String, Set<String>> matrix = new LinkedHashMap<>();
        matrix.put(User.UserRole.SUPER_ADMIN.name(), all);
        matrix.put(User.UserRole.ADMIN.name(), all);
        matrix.put(User.UserRole.MANAGER.name(), Set.of(
            "CRM_VIEW",
            "CRM_EDIT",
            "ERP_VIEW",
            "FIELDWORK_VIEW",
            "FINANCE_VIEW",
            "PM_VIEW",
            "PM_CREATE",
            "PM_EDIT",
            "PM_DELETE",
            "HR_VIEW",
            "HR_CREATE",
            "HR_EDIT",
            "HR_LEAVE_REQUEST_VIEW",
            "HR_LEAVE_REQUEST_APPROVE",
            "HR_TIMESHEET_VIEW",
            "HR_TIMESHEET_APPROVE",
            "HR_REIMBURSEMENT_VIEW",
            "HR_REIMBURSEMENT_APPROVE",
            "HR_TRAINING_VIEW",
            "HR_TRAINING_ENROLL",
            "HR_DOCUMENT_VIEW",
            "HR_PAYSLIP_VIEW",
            "HR_APPRAISAL_VIEW",
            "HR_APPRAISAL_EDIT",
            "HR_OFFER_VIEW",
            "REPORT_VIEW",
            "REPORT_EXPORT",
            "REPORT_TEAM_VIEW",
            "DASHBOARD_SELF_VIEW",
            "DASHBOARD_TEAM_VIEW",
            "DASHBOARD_HR_VIEW",
            "DASHBOARD_OPERATIONS_VIEW",
            "INSIGHTS_VIEW",
            "DATA_SCOPE_TEAM"
        ));
        matrix.put(User.UserRole.SALES_MANAGER.name(), Set.of(
            "CRM_VIEW",
            "CRM_CREATE",
            "CRM_EDIT",
            "PM_VIEW",
            "PM_CREATE",
            "PM_EDIT",
            "REPORT_VIEW",
            "REPORT_EXPORT",
            "REPORT_TEAM_VIEW",
            "DASHBOARD_SELF_VIEW",
            "DASHBOARD_TEAM_VIEW",
            "INSIGHTS_VIEW",
            "DATA_SCOPE_TEAM"
        ));
        matrix.put(User.UserRole.SALES_REP.name(), Set.of(
            "CRM_VIEW",
            "CRM_CREATE",
            "CRM_EDIT",
            "PM_VIEW",
            "DASHBOARD_SELF_VIEW",
            "INSIGHTS_VIEW",
            "REPORT_PERSONAL_VIEW",
            "DATA_SCOPE_OWN"
        ));
        matrix.put(User.UserRole.FINANCE.name(), Set.of(
            "FINANCE_VIEW",
            "FINANCE_CREATE",
            "FINANCE_EDIT",
            "PM_VIEW",
            "REPORT_VIEW",
            "REPORT_EXPORT",
            "REPORT_TEAM_VIEW",
            "DASHBOARD_SELF_VIEW",
            "DASHBOARD_FINANCE_VIEW",
            "INSIGHTS_VIEW",
            "DATA_SCOPE_ORG"
        ));
        matrix.put(User.UserRole.SERVICE_TECH.name(), Set.of(
            "ERP_VIEW",
            "ERP_EDIT",
            "FIELDWORK_VIEW",
            "FIELDWORK_CREATE",
            "FIELDWORK_EDIT",
            "PM_VIEW",
            "PM_CREATE",
            "PM_EDIT",
            "DASHBOARD_TECH_VIEW",
            "INSIGHTS_VIEW",
            "DATA_SCOPE_OWN"
        ));
        matrix.put(User.UserRole.HR.name(), Set.of(
            "HR_VIEW",
            "HR_CREATE",
            "HR_EDIT",
            "PM_VIEW",
            "HR_DELETE",
            "HR_EMPLOYEE_VIEW",
            "HR_EMPLOYEE_CREATE",
            "HR_EMPLOYEE_EDIT",
            "HR_EMPLOYEE_DELETE",
            "HR_DEPARTMENT_VIEW",
            "HR_DEPARTMENT_CREATE",
            "HR_DEPARTMENT_EDIT",
            "HR_DEPARTMENT_DELETE",
            "HR_POSITION_VIEW",
            "HR_POSITION_CREATE",
            "HR_POSITION_EDIT",
            "HR_POSITION_DELETE",
            "HR_LEAVE_REQUEST_VIEW",
            "HR_LEAVE_REQUEST_CREATE",
            "HR_LEAVE_REQUEST_APPROVE",
            "HR_TIMESHEET_VIEW",
            "HR_TIMESHEET_CREATE",
            "HR_TIMESHEET_APPROVE",
            "HR_REIMBURSEMENT_VIEW",
            "HR_REIMBURSEMENT_CREATE",
            "HR_REIMBURSEMENT_APPROVE",
            "HR_PAYROLL_RUN_VIEW",
            "HR_PAYROLL_RUN_CREATE",
            "HR_PAYROLL_RUN_EDIT",
            "HR_PAYROLL_RUN_DELETE",
            "HR_PAYROLL_PROFILE_VIEW",
            "HR_PAYROLL_PROFILE_CREATE",
            "HR_PAYROLL_PROFILE_EDIT",
            "HR_PAYROLL_PROFILE_DELETE",
            "HR_TRAINING_VIEW",
            "HR_TRAINING_CREATE",
            "HR_TRAINING_EDIT",
            "HR_TRAINING_DELETE",
            "HR_TRAINING_ENROLL",
            "HR_DOCUMENT_VIEW",
            "HR_DOCUMENT_CREATE",
            "HR_DOCUMENT_DELETE",
            "HR_DOCUMENT_VERIFY",
            "HR_PAYSLIP_VIEW",
            "HR_PAYSLIP_CREATE",
            "HR_OFFER_VIEW",
            "HR_OFFER_CREATE",
            "HR_OFFER_EDIT",
            "HR_APPRAISAL_VIEW",
            "HR_APPRAISAL_CREATE",
            "HR_APPRAISAL_EDIT",
            "REPORT_VIEW",
            "REPORT_EXPORT",
            "REPORT_TEAM_VIEW",
            "DASHBOARD_HR_VIEW",
            "INSIGHTS_VIEW",
            "DATA_SCOPE_ORG"
        ));
        matrix.put(User.UserRole.RECRUITER.name(), Set.of(
            "HR_VIEW",
            "HR_EMPLOYEE_VIEW",
            "HR_OFFER_VIEW",
            "HR_OFFER_CREATE",
            "HR_OFFER_EDIT",
            "REPORT_VIEW",
            "DASHBOARD_HR_VIEW",
            "INSIGHTS_VIEW",
            "DATA_SCOPE_TEAM"
        ));
        matrix.put(User.UserRole.PAYROLL.name(), Set.of(
            "HR_VIEW",
            "HR_EMPLOYEE_VIEW",
            "HR_PAYSLIP_VIEW",
            "HR_PAYSLIP_CREATE",
            "HR_PAYROLL_RUN_VIEW",
            "HR_PAYROLL_RUN_CREATE",
            "HR_PAYROLL_RUN_EDIT",
            "HR_PAYROLL_RUN_DELETE",
            "HR_PAYROLL_PROFILE_VIEW",
            "HR_PAYROLL_PROFILE_CREATE",
            "HR_PAYROLL_PROFILE_EDIT",
            "HR_PAYROLL_PROFILE_DELETE",
            "REPORT_VIEW",
            "REPORT_EXPORT",
            "DASHBOARD_FINANCE_VIEW",
            "DASHBOARD_HR_VIEW",
            "INSIGHTS_VIEW",
            "DATA_SCOPE_ORG"
        ));
        matrix.put(User.UserRole.EXECUTIVE.name(), Set.of(
            "HR_VIEW",
            "HR_EMPLOYEE_VIEW",
            "PM_VIEW",
            "HR_DEPARTMENT_VIEW",
            "HR_POSITION_VIEW",
            "HR_TRAINING_VIEW",
            "HR_DOCUMENT_VIEW",
            "HR_PAYSLIP_VIEW",
            "HR_OFFER_VIEW",
            "HR_APPRAISAL_VIEW",
            "REPORT_VIEW",
            "REPORT_TEAM_VIEW",
            "DASHBOARD_HR_VIEW",
            "DASHBOARD_FINANCE_VIEW",
            "DASHBOARD_OPERATIONS_VIEW",
            "INSIGHTS_VIEW",
            "DATA_SCOPE_ORG"
        ));
        matrix.put(User.UserRole.EMPLOYEE.name(), Set.of(
            "HR_VIEW",
            "HR_CREATE",
            "HR_LEAVE_REQUEST_VIEW",
            "HR_LEAVE_REQUEST_CREATE",
            "HR_TIMESHEET_VIEW",
            "HR_TIMESHEET_CREATE",
            "HR_REIMBURSEMENT_VIEW",
            "HR_REIMBURSEMENT_CREATE",
            "HR_TRAINING_VIEW",
            "HR_TRAINING_ENROLL",
            "HR_DOCUMENT_VIEW",
            "HR_DOCUMENT_CREATE",
            "HR_PAYSLIP_VIEW",
            "HR_APPRAISAL_VIEW",
            "PM_VIEW",
            "PM_CREATE",
            "PM_EDIT",
            "INSIGHTS_VIEW",
            "REPORT_PERSONAL_VIEW",
            "DATA_SCOPE_OWN"
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
        descriptions.put(User.UserRole.RECRUITER.name(), "Recruitment pipeline access");
        descriptions.put(User.UserRole.PAYROLL.name(), "Payroll operations and payslip management");
        descriptions.put(User.UserRole.EXECUTIVE.name(), "Executive read-only analytics access");
        descriptions.put(User.UserRole.VIEWER.name(), "Read-only operational access");
        descriptions.put(User.UserRole.READ_ONLY.name(), "Minimal read-only access");
        descriptions.put(User.UserRole.HR.name(), "HR operations and payroll management");
        descriptions.put(User.UserRole.EMPLOYEE.name(), "Employee self-service access");
        return descriptions;
    }

    private record PermissionSeed(String key, String module, String action, String description) {
    }
}
