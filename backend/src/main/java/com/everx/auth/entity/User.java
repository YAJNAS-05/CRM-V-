package com.everx.auth.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder.Default;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", schema = "everx_auth")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class User extends BaseEntity implements UserDetails {

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "auth_id", unique = true)
    private java.util.UUID authId;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "phone")
    private String phone;

    @Column(name = "role", nullable = false)
    @Enumerated(EnumType.STRING)
    private UserRole role;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            schema = "everx_auth",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Default
    private Set<Role> assignedRoles = new HashSet<>();

    @Column(name = "office_location", nullable = false)
    @Enumerated(EnumType.STRING)
    private OfficeLocation officeLocation;

    @Column(name = "is_active", nullable = false)
    @Default
    private Boolean isActive = true;

    @Column(name = "last_login")
    private java.time.OffsetDateTime lastLogin;

    @Column(name = "avatar_url")
    private String avatarUrl;

    public enum UserRole {
        SUPER_ADMIN,
        ADMIN,
        MANAGER,
        RECRUITER,
        PAYROLL,
        EXECUTIVE,
        SALES_REP,
        VIEWER,
        SERVICE_TECH,
        FINANCE,
        SALES_MANAGER,
        READ_ONLY,
        HR,
        EMPLOYEE
    }

    public enum OfficeLocation {
        AUSTRALIA, USA, JAPAN
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        java.util.Set<String> authorityNames = new java.util.LinkedHashSet<>();
        java.util.Set<String> roleNames = new java.util.LinkedHashSet<>();

        if (assignedRoles != null) {
            for (Role assignedRole : assignedRoles) {
                if (assignedRole != null
                        && Boolean.TRUE.equals(assignedRole.getIsActive())
                        && !Boolean.TRUE.equals(assignedRole.getIsDeleted())) {
                    roleNames.add(assignedRole.getName());

                    if (assignedRole.getPermissions() != null) {
                        for (Permission permission : assignedRole.getPermissions()) {
                            if (permission != null
                                    && Boolean.TRUE.equals(permission.getIsActive())
                                    && !Boolean.TRUE.equals(permission.getIsDeleted())) {
                                authorityNames.add(permission.getPermissionKey());
                            }
                        }
                    }
                }
            }
        }

        // Legacy fallback for older users that still rely on the primary role column.
        if (roleNames.isEmpty() && role != null) {
            roleNames.add(role.name());
        }

        for (String roleName : roleNames) {
            authorityNames.add("ROLE_" + roleName);
        }

        return authorityNames.stream().map(SimpleGrantedAuthority::new).toList();
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return isActive;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }
}
