package com.everx.settings.service;

import com.everx.auth.entity.Role;
import com.everx.auth.entity.User;
import com.everx.auth.repository.RoleRepository;
import com.everx.auth.service.AuthService;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import com.everx.settings.dto.SettingsDto;
import com.everx.settings.dto.UpdateSettingsRequest;
import com.everx.settings.entity.RoleSettings;
import com.everx.settings.entity.UserSettings;
import com.everx.settings.repository.RoleSettingsRepository;
import com.everx.settings.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class SettingsService {

    private final AuthService authService;
    private final RoleRepository roleRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final RoleSettingsRepository roleSettingsRepository;

    public SettingsDto getPersonalSettings(UUID authUserId) {
        User user = resolveAuthenticatedUser(authUserId);
        return SettingsDto.fromUserSettings(ensureUserSettings(user));
    }

    public SettingsDto updatePersonalSettings(UUID authUserId, UpdateSettingsRequest request) {
        User user = resolveAuthenticatedUser(authUserId);
        UserSettings settings = ensureUserSettings(user);
        applyRequest(settings, request);
        return SettingsDto.fromUserSettings(userSettingsRepository.save(settings));
    }

    public SettingsDto getRoleSettings(String roleName) {
        Role role = resolveRole(roleName);
        return SettingsDto.fromRoleSettings(ensureRoleSettings(role));
    }

    public SettingsDto updateRoleSettings(String roleName, UpdateSettingsRequest request) {
        Role role = resolveRole(roleName);
        RoleSettings settings = ensureRoleSettings(role);
        applyRequest(settings, request);
        return SettingsDto.fromRoleSettings(roleSettingsRepository.save(settings));
    }

    private User resolveAuthenticatedUser(UUID authUserId) {
        if (authUserId == null) {
            throw new ValidationException("Authentication required");
        }
        return authService.getCurrentUserByAuthId(authUserId);
    }

    private Role resolveRole(String roleName) {
        if (roleName == null || roleName.trim().isEmpty()) {
            throw new ValidationException("roleName", "Role name is required");
        }

        String normalizedRoleName = roleName.trim().toUpperCase();
        return roleRepository.findByNameWithPermissions(normalizedRoleName)
                .orElseThrow(() -> new EntityNotFoundException("Role not found with name: " + normalizedRoleName));
    }

    private UserSettings ensureUserSettings(User user) {
        return userSettingsRepository.findByUser_IdAndIsDeletedFalse(user.getId())
                .orElseGet(() -> userSettingsRepository.save(UserSettings.builder()
                        .user(user)
                        .theme("light")
                        .language("en")
                        .timezone(ZoneId.systemDefault().getId())
                        .notificationsEnabled(true)
                        .emailNotifications(true)
                        .inAppNotifications(true)
                        .autoRefresh(true)
                        .itemsPerPage(25)
                        .build()));
    }

    private RoleSettings ensureRoleSettings(Role role) {
        return roleSettingsRepository.findByRole_NameAndIsDeletedFalse(role.getName())
                .orElseGet(() -> roleSettingsRepository.save(RoleSettings.builder()
                        .role(role)
                        .theme("light")
                        .language("en")
                        .timezone(ZoneId.systemDefault().getId())
                        .notificationsEnabled(true)
                        .emailNotifications(true)
                        .inAppNotifications(true)
                        .autoRefresh(true)
                        .itemsPerPage(25)
                        .build()));
    }

    private void applyRequest(UserSettings settings, UpdateSettingsRequest request) {
        if (request == null) {
            return;
        }

        applyCommonRequest(settings::setTheme, settings::setLanguage, settings::setTimezone,
                settings::setNotificationsEnabled, settings::setEmailNotifications,
                settings::setInAppNotifications, settings::setAutoRefresh, settings::setItemsPerPage, request);
    }

    private void applyRequest(RoleSettings settings, UpdateSettingsRequest request) {
        if (request == null) {
            return;
        }

        applyCommonRequest(settings::setTheme, settings::setLanguage, settings::setTimezone,
                settings::setNotificationsEnabled, settings::setEmailNotifications,
                settings::setInAppNotifications, settings::setAutoRefresh, settings::setItemsPerPage, request);
    }

    private void applyCommonRequest(
            java.util.function.Consumer<String> themeSetter,
            java.util.function.Consumer<String> languageSetter,
            java.util.function.Consumer<String> timezoneSetter,
            java.util.function.Consumer<Boolean> notificationsSetter,
            java.util.function.Consumer<Boolean> emailNotificationsSetter,
            java.util.function.Consumer<Boolean> inAppNotificationsSetter,
            java.util.function.Consumer<Boolean> autoRefreshSetter,
            java.util.function.Consumer<Integer> itemsPerPageSetter,
            UpdateSettingsRequest request
    ) {
        if (request.getTheme() != null && !request.getTheme().trim().isEmpty()) {
            themeSetter.accept(request.getTheme().trim().toLowerCase());
        }
        if (request.getLanguage() != null && !request.getLanguage().trim().isEmpty()) {
            languageSetter.accept(request.getLanguage().trim().toLowerCase());
        }
        if (request.getTimezone() != null && !request.getTimezone().trim().isEmpty()) {
            timezoneSetter.accept(request.getTimezone().trim());
        }
        if (request.getNotificationsEnabled() != null) {
            notificationsSetter.accept(request.getNotificationsEnabled());
        }
        if (request.getEmailNotifications() != null) {
            emailNotificationsSetter.accept(request.getEmailNotifications());
        }
        if (request.getInAppNotifications() != null) {
            inAppNotificationsSetter.accept(request.getInAppNotifications());
        }
        if (request.getAutoRefresh() != null) {
            autoRefreshSetter.accept(request.getAutoRefresh());
        }
        if (request.getItemsPerPage() != null && request.getItemsPerPage() > 0) {
            itemsPerPageSetter.accept(request.getItemsPerPage());
        }
    }
}