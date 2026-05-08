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

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "enhanced_roles", schema = "everx_security", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"name", "tenant_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true, exclude = {"permissions", "users"})
public class EnhancedRole extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "tenant_id")
    private UUID tenantId;

    @Column(name = "display_name", nullable = false, length = 200)
    private String displayName;

    @Column(name = "description")
    private String description;

    @Column(name = "is_system", nullable = false)
    @Builder.Default
    private Boolean isSystem = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "priority", nullable = false)
    @Builder.Default
    private Integer priority = 0;

    @Column(name = "category", length = 50)
    private String category; // SYSTEM, BUSINESS, CUSTOM, etc.

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "role_permissions",
        schema = "everx_security",
        joinColumns = @JoinColumn(name = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    @Builder.Default
    private Set<EnhancedPermission> permissions = new HashSet<>();

    @ManyToMany(mappedBy = "enhancedRoles", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<com.everx.auth.entity.User> users = new HashSet<>();

    // Helper methods
    public boolean isTenantSpecific() {
        return tenantId != null;
    }

    public boolean hasPermission(String permissionKey) {
        return permissions.stream()
                .anyMatch(p -> p.getPermissionKey().equals(permissionKey) && p.getIsActive());
    }

    public boolean hasModulePermission(String module, String action) {
        return permissions.stream()
                .anyMatch(p -> p.getModule().equals(module) && 
                           p.getAction().equals(action) && 
                           p.getIsActive());
    }

    public void addPermission(EnhancedPermission permission) {
        permissions.add(permission);
    }

    public void removePermission(EnhancedPermission permission) {
        permissions.remove(permission);
    }

    public boolean isHigherPriority(EnhancedRole other) {
        return this.priority > other.priority;
    }
}
