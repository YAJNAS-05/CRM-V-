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

@Entity
@Table(name = "workflow_definitions", schema = "everx_shared")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class WorkflowDefinition extends BaseEntity {

    @Column(name = "module", nullable = false, length = 50)
    private String module;

    @Column(name = "entity", nullable = false, length = 50)
    private String entity;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "initial_status", length = 60)
    private String initialStatus;

    @Column(name = "is_default", nullable = false)
    @lombok.Builder.Default
    private Boolean isDefault = false;

    @Column(name = "is_active", nullable = false)
    @lombok.Builder.Default
    private Boolean isActive = true;
}
