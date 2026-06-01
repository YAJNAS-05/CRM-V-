package com.everx.settings.controller;

import com.everx.settings.dto.SettingsDto;
import com.everx.settings.dto.UpdateSettingsRequest;
import com.everx.settings.service.SettingsService;
import com.everx.shared.dto.ApiResponse;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<SettingsDto>> getMySettings(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(settingsService.getPersonalSettings(extractUserId(authentication)), "Personal settings retrieved successfully"));
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<SettingsDto>> updateMySettings(
            Authentication authentication,
            @Valid @RequestBody UpdateSettingsRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(settingsService.updatePersonalSettings(extractUserId(authentication), request), "Personal settings updated successfully"));
    }

    @GetMapping("/roles/{roleName}")
    @PreAuthorize("hasAnyAuthority('SETTINGS_ADMIN_VIEW', 'SETTINGS_ADMIN_EDIT')")
    public ResponseEntity<ApiResponse<SettingsDto>> getRoleSettings(@PathVariable String roleName) {
        return ResponseEntity.ok(ApiResponse.ok(settingsService.getRoleSettings(roleName), "Role settings retrieved successfully"));
    }

    @PutMapping("/roles/{roleName}")
    @PreAuthorize("hasAuthority('SETTINGS_ADMIN_EDIT')")
    public ResponseEntity<ApiResponse<SettingsDto>> updateRoleSettings(
            @PathVariable String roleName,
            @Valid @RequestBody UpdateSettingsRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(settingsService.updateRoleSettings(roleName, request), "Role settings updated successfully"));
    }

    private UUID extractUserId(Authentication authentication) {
        if (authentication == null) {
            throw new ValidationException("Authentication required");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UUID uuid) {
            return uuid;
        }

        if (principal instanceof String subject) {
            try {
                return UUID.fromString(subject);
            } catch (IllegalArgumentException ignored) {
                throw new ValidationException("Authentication required");
            }
        }

        throw new ValidationException("Authentication required");
    }
}