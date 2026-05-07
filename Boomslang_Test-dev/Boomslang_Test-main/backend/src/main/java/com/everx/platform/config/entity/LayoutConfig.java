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
@Table(name = "layout_configs", schema = "everx_shared")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class LayoutConfig extends BaseEntity {

    @Column(name = "module", nullable = false, length = 50)
    private String module;

    @Column(name = "entity", nullable = false, length = 50)
    private String entity;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Column(name = "layout_json", columnDefinition = "TEXT", nullable = false)
    private String layoutJson;

    @Column(name = "status", nullable = false, length = 20)
    @lombok.Builder.Default
    private String status = "DRAFT";

    @Column(name = "version_number", nullable = false)
    @lombok.Builder.Default
    private Integer versionNumber = 1;

    @Column(name = "applies_to_roles", columnDefinition = "TEXT")
    private String appliesToRoles;

    @Column(name = "published_at")
    private OffsetDateTime publishedAt;

    @Column(name = "published_by")
    private UUID publishedBy;

    @Column(name = "is_default", nullable = false)
    @lombok.Builder.Default
    private Boolean isDefault = false;

    @Column(name = "is_active", nullable = false)
    @lombok.Builder.Default
    private Boolean isActive = true;
}
