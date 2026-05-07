package com.everx.platform.config.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "workflow_approval_requests", schema = "everx_shared")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class WorkflowApprovalRequest extends BaseEntity {

    @Column(name = "module", nullable = false, length = 50)
    private String module;

    @Column(name = "entity", nullable = false, length = 50)
    private String entity;

    @Column(name = "entity_id", nullable = false, length = 64)
    private String entityId;

    @Column(name = "from_status", nullable = false, length = 60)
    private String fromStatus;

    @Column(name = "to_status", nullable = false, length = 60)
    private String toStatus;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @Column(name = "approver_role", length = 80)
    private String approverRole;

    @Column(name = "escalation_role", length = 80)
    private String escalationRole;

    @Column(name = "escalation_after_hours")
    private Integer escalationAfterHours;

    @Column(name = "requested_by")
    private UUID requestedBy;

    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "due_at")
    private OffsetDateTime dueAt;

    @Column(name = "sla_breached_at")
    private OffsetDateTime slaBreachedAt;

    @Column(name = "escalated_at")
    private OffsetDateTime escalatedAt;

    @Column(name = "escalation_level")
    private Integer escalationLevel;

    @Column(name = "resolved_at")
    private OffsetDateTime resolvedAt;

    @Column(name = "applied_at")
    private OffsetDateTime appliedAt;
}
