package com.everx.settings.entity;

import com.everx.auth.entity.Role;
import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.ZoneId;

@Entity
@Table(
        name = "role_settings",
        schema = "everx_auth",
        uniqueConstraints = @UniqueConstraint(name = "uk_role_settings_role_id", columnNames = "role_id")
)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class RoleSettings extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(name = "theme", nullable = false)
    @lombok.Builder.Default
    private String theme = "light";

    @Column(name = "language", nullable = false)
    @lombok.Builder.Default
    private String language = "en";

    @Column(name = "timezone", nullable = false)
    @lombok.Builder.Default
    private String timezone = ZoneId.systemDefault().getId();

    @Column(name = "notifications_enabled", nullable = false)
    @lombok.Builder.Default
    private Boolean notificationsEnabled = true;

    @Column(name = "email_notifications", nullable = false)
    @lombok.Builder.Default
    private Boolean emailNotifications = true;

    @Column(name = "in_app_notifications", nullable = false)
    @lombok.Builder.Default
    private Boolean inAppNotifications = true;

    @Column(name = "auto_refresh", nullable = false)
    @lombok.Builder.Default
    private Boolean autoRefresh = true;

    @Column(name = "items_per_page", nullable = false)
    @lombok.Builder.Default
    private Integer itemsPerPage = 25;
}