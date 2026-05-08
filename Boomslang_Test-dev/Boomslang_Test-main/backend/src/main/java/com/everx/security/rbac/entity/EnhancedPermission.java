package com.everx.security.rbac.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "enhanced_permissions", schema = "everx_security", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"permission_key", "tenant_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class EnhancedPermission extends BaseEntity {

    @Column(name = "permission_key", nullable = false, length = 100)
    private String permissionKey;

    @Column(name = "tenant_id")
    private UUID tenantId;

    @Column(name = "module", nullable = false, length = 100)
    private String module;

    @Column(name = "action", nullable = false, length = 100)
    private String action;

    @Column(name = "resource_type", length = 100)
    private String resourceType;

    @Column(name = "description")
    private String description;

    @Column(name = "is_system", nullable = false)
    @Builder.Default
    private Boolean isSystem = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "level", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PermissionLevel level = PermissionLevel.READ;

    @Column(name = "conditions", columnDefinition = "TEXT")
    private String conditions; // JSON conditions for ABAC

    public enum PermissionLevel {
        READ, WRITE, DELETE, ADMIN, OWNER
    }

    // Helper methods
    public boolean isTenantSpecific() {
        return tenantId != null;
    }

    public boolean canAccess(String action, String resourceType) {
        return this.action.equalsIgnoreCase(action) && 
               (this.resourceType == null || this.resourceType.equalsIgnoreCase(resourceType));
    }

    public boolean hasHigherLevel(PermissionLevel requiredLevel) {
        return this.level.ordinal() >= requiredLevel.ordinal();
    }
}
