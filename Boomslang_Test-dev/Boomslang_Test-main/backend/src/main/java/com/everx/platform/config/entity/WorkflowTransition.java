package com.everx.platform.config.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "workflow_transitions", schema = "everx_shared")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class WorkflowTransition extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workflow_definition_id", nullable = false)
    private WorkflowDefinition workflowDefinition;

    @Column(name = "from_status", nullable = false, length = 60)
    private String fromStatus;

    @Column(name = "to_status", nullable = false, length = 60)
    private String toStatus;

    @Column(name = "action_label", length = 80)
    private String actionLabel;

    @Column(name = "requires_approval", nullable = false)
    @lombok.Builder.Default
    private Boolean requiresApproval = false;

    @Column(name = "approver_role", length = 80)
    private String approverRole;

    @Column(name = "sla_hours")
    private Integer slaHours;

    @Column(name = "escalation_role", length = 80)
    private String escalationRole;

    @Column(name = "escalation_after_hours")
    private Integer escalationAfterHours;

    @Column(name = "is_active", nullable = false)
    @lombok.Builder.Default
    private Boolean isActive = true;
}
