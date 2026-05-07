package com.everx.shared.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public final class SecurityUserContext {

    private SecurityUserContext() {
    }

    public static Optional<UUID> getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UUID principalUuid) {
            return Optional.of(principalUuid);
        }

        if (principal instanceof String principalString) {
            UUID parsedPrincipal = tryParseUuid(principalString);
            if (parsedPrincipal != null) {
                return Optional.of(parsedPrincipal);
            }
        }

        UUID parsedName = tryParseUuid(authentication.getName());
        return Optional.ofNullable(parsedName);
    }

    public static UUID getCurrentUserIdOrNull() {
        return getCurrentUserId().orElse(null);
    }

    public static List<String> getCurrentUserRoles() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return List.of();
        }

        return authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .filter(role -> role != null && !role.isBlank())
                .toList();
    }

    private static UUID tryParseUuid(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException ignored) {
            return null;
        }
    }
}