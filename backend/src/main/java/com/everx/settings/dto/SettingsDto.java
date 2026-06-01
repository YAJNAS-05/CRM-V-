package com.everx.settings.dto;

import com.everx.auth.entity.Role;
import com.everx.auth.entity.User;
import com.everx.settings.entity.RoleSettings;
import com.everx.settings.entity.UserSettings;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SettingsDto {

    private String scope;
    private String key;
    private UUID userId;
    private String roleName;
    private String theme;
    private String language;
    private String timezone;
    private Boolean notificationsEnabled;
    private Boolean emailNotifications;
    private Boolean inAppNotifications;
    private Boolean autoRefresh;
    private Integer itemsPerPage;
    private OffsetDateTime updatedAt;

    public static SettingsDto fromUserSettings(UserSettings settings) {
        User user = settings.getUser();
        return SettingsDto.builder()
                .scope("USER")
                .key(user != null ? user.getId().toString() : null)
                .userId(user != null ? user.getId() : null)
                .theme(settings.getTheme())
                .language(settings.getLanguage())
                .timezone(settings.getTimezone())
                .notificationsEnabled(settings.getNotificationsEnabled())
                .emailNotifications(settings.getEmailNotifications())
                .inAppNotifications(settings.getInAppNotifications())
                .autoRefresh(settings.getAutoRefresh())
                .itemsPerPage(settings.getItemsPerPage())
                .updatedAt(settings.getUpdatedAt())
                .build();
    }

    public static SettingsDto fromRoleSettings(RoleSettings settings) {
        Role role = settings.getRole();
        return SettingsDto.builder()
                .scope("ROLE")
                .key(role != null ? role.getName() : null)
                .roleName(role != null ? role.getName() : null)
                .theme(settings.getTheme())
                .language(settings.getLanguage())
                .timezone(settings.getTimezone())
                .notificationsEnabled(settings.getNotificationsEnabled())
                .emailNotifications(settings.getEmailNotifications())
                .inAppNotifications(settings.getInAppNotifications())
                .autoRefresh(settings.getAutoRefresh())
                .itemsPerPage(settings.getItemsPerPage())
                .updatedAt(settings.getUpdatedAt())
                .build();
    }
}