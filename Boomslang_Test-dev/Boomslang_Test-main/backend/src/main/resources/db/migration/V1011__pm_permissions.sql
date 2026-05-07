-- PM permissions (granular)

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_VIEW', 'PM', 'VIEW', 'View PM module', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_CREATE', 'PM', 'CREATE', 'Create PM records', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_CREATE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_EDIT', 'PM', 'EDIT', 'Edit PM records', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_EDIT');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_DELETE', 'PM', 'DELETE', 'Delete PM records', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_DELETE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_PROJECT_VIEW', 'PM', 'PROJECT_VIEW', 'View projects', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_PROJECT_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_PROJECT_CREATE', 'PM', 'PROJECT_CREATE', 'Create projects', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_PROJECT_CREATE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_PROJECT_EDIT', 'PM', 'PROJECT_EDIT', 'Edit projects', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_PROJECT_EDIT');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_PROJECT_DELETE', 'PM', 'PROJECT_DELETE', 'Delete projects', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_PROJECT_DELETE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_PROJECT_MEMBER_ADD', 'PM', 'PROJECT_MEMBER_ADD', 'Add project members', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_PROJECT_MEMBER_ADD');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_PROJECT_MEMBER_REMOVE', 'PM', 'PROJECT_MEMBER_REMOVE', 'Remove project members', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_PROJECT_MEMBER_REMOVE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_PROJECT_COST_ADD', 'PM', 'PROJECT_COST_ADD', 'Add project costs', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_PROJECT_COST_ADD');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_TASK_VIEW', 'PM', 'TASK_VIEW', 'View tasks', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_TASK_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_TASK_CREATE', 'PM', 'TASK_CREATE', 'Create tasks', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_TASK_CREATE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_TASK_EDIT', 'PM', 'TASK_EDIT', 'Edit tasks', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_TASK_EDIT');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_TASK_DELETE', 'PM', 'TASK_DELETE', 'Delete tasks', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_TASK_DELETE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_TASK_ASSIGN', 'PM', 'TASK_ASSIGN', 'Assign tasks', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_TASK_ASSIGN');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_MILESTONE_VIEW', 'PM', 'MILESTONE_VIEW', 'View milestones', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_MILESTONE_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_MILESTONE_CREATE', 'PM', 'MILESTONE_CREATE', 'Create milestones', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_MILESTONE_CREATE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_MILESTONE_EDIT', 'PM', 'MILESTONE_EDIT', 'Edit milestones', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_MILESTONE_EDIT');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_MILESTONE_DELETE', 'PM', 'MILESTONE_DELETE', 'Delete milestones', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_MILESTONE_DELETE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_SPRINT_VIEW', 'PM', 'SPRINT_VIEW', 'View sprints', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_SPRINT_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_SPRINT_CREATE', 'PM', 'SPRINT_CREATE', 'Create sprints', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_SPRINT_CREATE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_SPRINT_EDIT', 'PM', 'SPRINT_EDIT', 'Edit sprints', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_SPRINT_EDIT');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_SPRINT_DELETE', 'PM', 'SPRINT_DELETE', 'Delete sprints', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_SPRINT_DELETE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_RISK_VIEW', 'PM', 'RISK_VIEW', 'View risks', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_RISK_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_RISK_CREATE', 'PM', 'RISK_CREATE', 'Create risks', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_RISK_CREATE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_RISK_EDIT', 'PM', 'RISK_EDIT', 'Edit risks', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_RISK_EDIT');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_RISK_DELETE', 'PM', 'RISK_DELETE', 'Delete risks', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_RISK_DELETE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_ISSUE_VIEW', 'PM', 'ISSUE_VIEW', 'View issues', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_ISSUE_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_ISSUE_CREATE', 'PM', 'ISSUE_CREATE', 'Create issues', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_ISSUE_CREATE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_ISSUE_EDIT', 'PM', 'ISSUE_EDIT', 'Edit issues', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_ISSUE_EDIT');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_ISSUE_DELETE', 'PM', 'ISSUE_DELETE', 'Delete issues', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_ISSUE_DELETE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_RESOURCE_VIEW', 'PM', 'RESOURCE_VIEW', 'View resource plans', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_RESOURCE_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_RESOURCE_CREATE', 'PM', 'RESOURCE_CREATE', 'Create resource plans', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_RESOURCE_CREATE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_RESOURCE_EDIT', 'PM', 'RESOURCE_EDIT', 'Edit resource plans', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_RESOURCE_EDIT');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_RESOURCE_DELETE', 'PM', 'RESOURCE_DELETE', 'Delete resource plans', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_RESOURCE_DELETE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_DEPENDENCY_VIEW', 'PM', 'DEPENDENCY_VIEW', 'View task dependencies', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_DEPENDENCY_VIEW');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_DEPENDENCY_CREATE', 'PM', 'DEPENDENCY_CREATE', 'Create task dependencies', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_DEPENDENCY_CREATE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_DEPENDENCY_EDIT', 'PM', 'DEPENDENCY_EDIT', 'Edit task dependencies', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_DEPENDENCY_EDIT');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_DEPENDENCY_DELETE', 'PM', 'DEPENDENCY_DELETE', 'Delete task dependencies', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_DEPENDENCY_DELETE');

INSERT INTO everx_auth.permissions (permission_key, module, action, description, is_active, is_deleted)
SELECT 'PM_TIME_LOG', 'PM', 'TIME_LOG', 'Log time from PM tasks', true, false
WHERE NOT EXISTS (SELECT 1 FROM everx_auth.permissions p WHERE p.permission_key = 'PM_TIME_LOG');

-- Assign PM permissions to admin roles by default
INSERT INTO everx_auth.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM everx_auth.roles r
JOIN everx_auth.permissions p ON p.permission_key IN (
    'PM_VIEW', 'PM_CREATE', 'PM_EDIT', 'PM_DELETE',
    'PM_PROJECT_VIEW', 'PM_PROJECT_CREATE', 'PM_PROJECT_EDIT', 'PM_PROJECT_DELETE',
    'PM_PROJECT_MEMBER_ADD', 'PM_PROJECT_MEMBER_REMOVE', 'PM_PROJECT_COST_ADD',
    'PM_TASK_VIEW', 'PM_TASK_CREATE', 'PM_TASK_EDIT', 'PM_TASK_DELETE', 'PM_TASK_ASSIGN',
    'PM_MILESTONE_VIEW', 'PM_MILESTONE_CREATE', 'PM_MILESTONE_EDIT', 'PM_MILESTONE_DELETE',
    'PM_SPRINT_VIEW', 'PM_SPRINT_CREATE', 'PM_SPRINT_EDIT', 'PM_SPRINT_DELETE',
    'PM_RISK_VIEW', 'PM_RISK_CREATE', 'PM_RISK_EDIT', 'PM_RISK_DELETE',
    'PM_ISSUE_VIEW', 'PM_ISSUE_CREATE', 'PM_ISSUE_EDIT', 'PM_ISSUE_DELETE',
    'PM_RESOURCE_VIEW', 'PM_RESOURCE_CREATE', 'PM_RESOURCE_EDIT', 'PM_RESOURCE_DELETE',
    'PM_DEPENDENCY_VIEW', 'PM_DEPENDENCY_CREATE', 'PM_DEPENDENCY_EDIT', 'PM_DEPENDENCY_DELETE',
    'PM_TIME_LOG'
)
WHERE r.name IN ('SUPER_ADMIN', 'ADMIN')
AND NOT EXISTS (
    SELECT 1 FROM everx_auth.role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);
