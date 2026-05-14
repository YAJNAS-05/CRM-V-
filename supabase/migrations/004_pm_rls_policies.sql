-- ============================================
-- PROJECT MANAGEMENT RLS POLICIES
-- ============================================

-- Enable RLS on PM tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_watchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- WORKSPACES POLICIES
-- ============================================

CREATE POLICY "Workspace members can view" ON workspaces
    FOR SELECT USING (
        is_active = true 
        AND (owner_id = get_current_user_id() OR has_permission('workspace:read'))
    );

CREATE POLICY "Admins can manage workspaces" ON workspaces
    FOR ALL USING (
        has_permission('workspace:manage') OR owner_id = get_current_user_id()
    );

-- ============================================
-- PORTFOLIOS POLICIES
-- ============================================

CREATE POLICY "Portfolio members can view" ON portfolios
    FOR SELECT USING (
        is_deleted = false 
        AND (has_permission('portfolio:read') OR has_permission('projects:read'))
    );

CREATE POLICY "Portfolio members can insert" ON portfolios
    FOR INSERT WITH CHECK (
        has_permission('portfolio:create') OR has_role('ADMIN') OR has_role('SUPER_ADMIN')
    );

CREATE POLICY "Portfolio members can update" ON portfolios
    FOR UPDATE USING (
        has_permission('portfolio:update') OR has_role('ADMIN') OR has_role('SUPER_ADMIN')
    );

CREATE POLICY "Portfolio members can delete" ON portfolios
    FOR DELETE USING (
        has_permission('portfolio:delete') OR has_role('ADMIN') OR has_role('SUPER_ADMIN')
    );

-- ============================================
-- PROJECTS POLICIES
-- ============================================

CREATE POLICY "Project members can view" ON projects
    FOR SELECT USING (
        is_deleted = false 
        AND is_archived = false
        AND (
            visibility = 'PUBLIC'
            OR has_permission('projects:read')
            OR EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = id AND pm.user_id = get_current_user_id())
        )
    );

CREATE POLICY "Project members can insert" ON projects
    FOR INSERT WITH CHECK (
        has_permission('projects:create') OR has_role('ADMIN') OR has_role('SUPER_ADMIN')
    );

CREATE POLICY "Project members can update" ON projects
    FOR UPDATE USING (
        has_permission('projects:update')
        OR owner_id = get_current_user_id()
        OR EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = id AND pm.user_id = get_current_user_id() AND pm.role IN ('OWNER', 'ADMIN'))
    );

CREATE POLICY "Project members can delete" ON projects
    FOR DELETE USING (
        has_permission('projects:delete')
        OR owner_id = get_current_user_id()
    );

-- ============================================
-- PROJECT MEMBERS POLICIES
-- ============================================

CREATE POLICY "Project members can view" ON project_members
    FOR SELECT USING (
        user_id = get_current_user_id()
        OR has_permission('projects:read')
    );

CREATE POLICY "Project admins can manage members" ON project_members
    FOR ALL USING (
        has_permission('projects:manage')
        OR EXISTS (
            SELECT 1 FROM project_members pm
            JOIN projects p ON p.id = pm.project_id
            WHERE pm.project_id = project_id 
            AND pm.user_id = get_current_user_id()
            AND pm.role IN ('OWNER', 'ADMIN')
        )
    );

-- ============================================
-- PROJECT TEMPLATES POLICIES
-- ============================================

CREATE POLICY "Anyone can view shared templates" ON project_templates
    FOR SELECT USING (
        is_deleted = false AND (is_shared = true OR created_by = get_current_user_id())
    );

CREATE POLICY "Admins can manage templates" ON project_templates
    FOR ALL USING (
        has_permission('projects:manage') OR has_role('ADMIN') OR has_role('SUPER_ADMIN')
    );

-- ============================================
-- MILESTONES POLICIES
-- ============================================

CREATE POLICY "Project members can view milestones" ON milestones
    FOR SELECT USING (
        is_deleted = false
        AND (
            has_permission('projects:read')
            OR EXISTS (
                SELECT 1 FROM project_members pm
                JOIN projects p ON p.id = pm.project_id
                WHERE pm.project_id = project_id AND pm.user_id = get_current_user_id()
            )
        )
    );

CREATE POLICY "Project members can manage milestones" ON milestones
    FOR ALL USING (
        has_permission('projects:update')
        OR EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = project_id 
            AND pm.user_id = get_current_user_id()
            AND pm.role IN ('OWNER', 'ADMIN', 'MEMBER')
        )
    );

-- ============================================
-- EPICS POLICIES
-- ============================================

CREATE POLICY "Project members can view epics" ON epics
    FOR SELECT USING (
        is_deleted = false
        AND (
            has_permission('projects:read')
            OR EXISTS (
                SELECT 1 FROM project_members pm
                WHERE pm.project_id = project_id AND pm.user_id = get_current_user_id()
            )
        )
    );

CREATE POLICY "Project members can manage epics" ON epics
    FOR ALL USING (
        has_permission('projects:update')
        OR EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = project_id 
            AND pm.user_id = get_current_user_id()
            AND pm.role IN ('OWNER', 'ADMIN', 'MEMBER')
        )
    );

-- ============================================
-- SPRINTS POLICIES
-- ============================================

CREATE POLICY "Project members can view sprints" ON sprints
    FOR SELECT USING (
        is_deleted = false
        AND (
            has_permission('projects:read')
            OR EXISTS (
                SELECT 1 FROM project_members pm
                WHERE pm.project_id = project_id AND pm.user_id = get_current_user_id()
            )
        )
    );

CREATE POLICY "Project members can manage sprints" ON sprints
    FOR ALL USING (
        has_permission('projects:update')
        OR EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = project_id 
            AND pm.user_id = get_current_user_id()
            AND pm.role IN ('OWNER', 'ADMIN', 'MEMBER')
        )
    );

-- ============================================
-- TASKS POLICIES
-- ============================================

CREATE POLICY "Task view policy" ON tasks
    FOR SELECT USING (
        is_deleted = false
        AND (
            -- Public tasks
            is_private = false
            -- Own tasks
            OR assignee_id = get_current_user_id()
            OR created_by = get_current_user_id()
            -- Project member
            OR EXISTS (
                SELECT 1 FROM project_members pm
                WHERE pm.project_id = project_id AND pm.user_id = get_current_user_id()
            )
            -- Watcher
            OR EXISTS (
                SELECT 1 FROM task_watchers tw
                WHERE tw.task_id = id AND tw.user_id = get_current_user_id()
            )
            -- Admin permission
            OR has_permission('tasks:read')
        )
    );

CREATE POLICY "Task insert policy" ON tasks
    FOR INSERT WITH CHECK (
        has_permission('tasks:create')
        OR EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = project_id 
            AND pm.user_id = get_current_user_id()
            AND pm.role IN ('OWNER', 'ADMIN', 'MEMBER')
        )
    );

CREATE POLICY "Task update policy" ON tasks
    FOR UPDATE USING (
        has_permission('tasks:update')
        OR assignee_id = get_current_user_id()
        OR created_by = get_current_user_id()
        OR EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = project_id 
            AND pm.user_id = get_current_user_id()
            AND pm.role IN ('OWNER', 'ADMIN')
        )
    );

CREATE POLICY "Task delete policy" ON tasks
    FOR DELETE USING (
        has_permission('tasks:delete')
        OR created_by = get_current_user_id()
        OR EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = project_id 
            AND pm.user_id = get_current_user_id()
            AND pm.role IN ('OWNER', 'ADMIN')
        )
    );

-- ============================================
-- TASK DEPENDENCIES POLICIES
-- ============================================

CREATE POLICY "Task dependencies view" ON task_dependencies
    FOR SELECT USING (
        has_permission('tasks:read')
        OR EXISTS (SELECT 1 FROM tasks t WHERE t.id = blocking_task_id AND t.assignee_id = get_current_user_id())
        OR EXISTS (SELECT 1 FROM tasks t WHERE t.id = blocked_task_id AND t.assignee_id = get_current_user_id())
    );

CREATE POLICY "Task dependencies manage" ON task_dependencies
    FOR ALL USING (
        has_permission('tasks:update')
        OR EXISTS (
            SELECT 1 FROM tasks t
            JOIN project_members pm ON pm.project_id = t.project_id
            WHERE t.id IN (blocking_task_id, blocked_task_id)
            AND pm.user_id = get_current_user_id()
            AND pm.role IN ('OWNER', 'ADMIN')
        )
    );

-- ============================================
-- TASK WATCHERS POLICIES
-- ============================================

CREATE POLICY "Task watchers view" ON task_watchers
    FOR SELECT USING (
        user_id = get_current_user_id()
        OR has_permission('tasks:read')
    );

CREATE POLICY "Task watchers manage" ON task_watchers
    FOR ALL USING (
        user_id = get_current_user_id()
        OR has_permission('tasks:update')
    );

-- ============================================
-- TIME LOGS POLICIES
-- ============================================

CREATE POLICY "Time logs view" ON task_time_logs
    FOR SELECT USING (
        user_id = get_current_user_id()
        OR has_permission('time:read')
        OR approved_by = get_current_user_id()
    );

CREATE POLICY "Time logs insert" ON task_time_logs
    FOR INSERT WITH CHECK (
        user_id = get_current_user_id()
        OR has_permission('time:create')
    );

CREATE POLICY "Time logs update" ON task_time_logs
    FOR UPDATE USING (
        user_id = get_current_user_id()
        OR approved_by = get_current_user_id()
        OR has_permission('time:approve')
    );

-- ============================================
-- CUSTOM FIELDS POLICIES
-- ============================================

CREATE POLICY "Custom fields view" ON custom_fields
    FOR SELECT USING (
        has_permission('projects:read')
        OR EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = project_id AND pm.user_id = get_current_user_id()
        )
    );

CREATE POLICY "Custom fields manage" ON custom_fields
    FOR ALL USING (
        has_permission('projects:update')
        OR EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = project_id 
            AND pm.user_id = get_current_user_id()
            AND pm.role IN ('OWNER', 'ADMIN')
        )
    );

-- ============================================
-- TASK CUSTOM FIELDS POLICIES
-- ============================================

CREATE POLICY "Task custom fields view" ON task_custom_fields
    FOR SELECT USING (
        has_permission('tasks:read')
        OR EXISTS (
            SELECT 1 FROM tasks t
            JOIN project_members pm ON pm.project_id = t.project_id
            WHERE t.id = task_id AND pm.user_id = get_current_user_id()
        )
    );

CREATE POLICY "Task custom fields manage" ON task_custom_fields
    FOR ALL USING (
        has_permission('tasks:update')
        OR EXISTS (
            SELECT 1 FROM tasks t
            WHERE t.id = task_id
            AND (t.assignee_id = get_current_user_id() OR t.created_by = get_current_user_id())
        )
    );

-- ============================================
-- ATTACHMENTS POLICIES
-- ============================================

CREATE POLICY "Attachments view" ON project_attachments
    FOR SELECT USING (
        has_permission('tasks:read')
        OR uploaded_by = get_current_user_id()
    );

CREATE POLICY "Attachments manage" ON project_attachments
    FOR ALL USING (
        has_permission('tasks:update')
        OR uploaded_by = get_current_user_id()
    );

-- ============================================
-- COMMENTS POLICIES
-- ============================================

CREATE POLICY "Comments view" ON project_comments
    FOR SELECT USING (
        is_deleted = false
        AND (
            has_permission('tasks:read')
            OR user_id = get_current_user_id()
            OR EXISTS (
                SELECT 1 FROM tasks t
                JOIN project_members pm ON pm.project_id = t.project_id
                WHERE t.id = task_id AND pm.user_id = get_current_user_id()
            )
        )
    );

CREATE POLICY "Comments insert" ON project_comments
    FOR INSERT WITH CHECK (
        user_id = get_current_user_id()
        AND (
            has_permission('tasks:comment')
            OR EXISTS (
                SELECT 1 FROM tasks t
                JOIN project_members pm ON pm.project_id = t.project_id
                WHERE t.id = task_id AND pm.user_id = get_current_user_id()
            )
        )
    );

CREATE POLICY "Comments update" ON project_comments
    FOR UPDATE USING (
        user_id = get_current_user_id()
        OR has_permission('tasks:moderate')
    );

CREATE POLICY "Comments delete" ON project_comments
    FOR DELETE USING (
        user_id = get_current_user_id()
        OR has_permission('tasks:moderate')
    );

-- ============================================
-- DEFAULT PERMISSIONS
-- ============================================

-- Insert default PM permissions
INSERT INTO permissions (permission_key, module, action, description)
VALUES 
    ('workspace:read', 'Workspace', 'read', 'View workspaces'),
    ('workspace:manage', 'Workspace', 'manage', 'Manage workspaces'),
    ('portfolio:read', 'Portfolio', 'read', 'View portfolios'),
    ('portfolio:create', 'Portfolio', 'create', 'Create portfolios'),
    ('portfolio:update', 'Portfolio', 'update', 'Update portfolios'),
    ('portfolio:delete', 'Portfolio', 'delete', 'Delete portfolios'),
    ('projects:read', 'Projects', 'read', 'View projects'),
    ('projects:create', 'Projects', 'create', 'Create projects'),
    ('projects:update', 'Projects', 'update', 'Update projects'),
    ('projects:delete', 'Projects', 'delete', 'Delete projects'),
    ('projects:manage', 'Projects', 'manage', 'Manage project settings'),
    ('tasks:read', 'Tasks', 'read', 'View tasks'),
    ('tasks:create', 'Tasks', 'create', 'Create tasks'),
    ('tasks:update', 'Tasks', 'update', 'Update tasks'),
    ('tasks:delete', 'Tasks', 'delete', 'Delete tasks'),
    ('tasks:comment', 'Tasks', 'comment', 'Comment on tasks'),
    ('tasks:moderate', 'Tasks', 'moderate', 'Moderate task content'),
    ('time:read', 'Time', 'read', 'View time logs'),
    ('time:create', 'Time', 'create', 'Log time'),
    ('time:approve', 'Time', 'approve', 'Approve time logs')
ON CONFLICT (permission_key) DO NOTHING;

-- ============================================
-- REALTIME PUBLICATION
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE project_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE sprints;
ALTER PUBLICATION supabase_realtime ADD TABLE epics;
ALTER PUBLICATION supabase_realtime ADD TABLE milestones;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
