package com.everx.auth.service;

import com.everx.auth.entity.User;
import com.everx.auth.repository.UserRepository;
import com.nimbusds.jwt.JWTClaimsSet;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class SupabaseUserService {

    private final UserRepository userRepository;

    public SupabaseUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Upsert a minimal user profile from Supabase claims.
     * Returns the persisted User entity.
     */
    public User upsertFromClaims(JWTClaimsSet claims) {
        if (claims == null) return null;

        UUID subjectUuid = null;
        try {
            String subject = claims.getSubject();
            if (subject != null) {
                subjectUuid = UUID.fromString(subject);
            }
        } catch (Exception ignored) {}

        String email = null;
        try { email = (String) claims.getClaim("email"); } catch (Exception ignored) {}
        if (email == null) return null;

        String fullName = null;
        try { fullName = (String) claims.getClaim("name"); } catch (Exception ignored) {}
        if (fullName == null) {
            try { fullName = (String) claims.getClaim("full_name"); } catch (Exception ignored) {}
        }

        String avatar = null;
        try { avatar = (String) claims.getClaim("avatar_url"); } catch (Exception ignored) {}

        String roleClaim = null;
        try { roleClaim = (String) claims.getClaim("role"); } catch (Exception ignored) {}

        if (roleClaim == null) {
            // try app_metadata
            try {
                Object appMeta = claims.getClaim("app_metadata");
                if (appMeta instanceof Map) {
                    Map<?,?> m = (Map<?,?>) appMeta;
                    Object r = m.get("role");
                    if (r != null) roleClaim = r.toString();
                }
            } catch (Exception ignored) {}
        }

        User user = null;
        if (subjectUuid != null) {
            user = userRepository.findByAuthIdWithRolesAndPermissions(subjectUuid).orElse(null);
        }
        if (user == null) {
            user = userRepository.findByEmail(email).orElse(null);
        }

        if (user == null) {
            // create minimal user
            String[] parts = (fullName != null) ? fullName.split(" ", 2) : new String[]{"", ""};
            String first = parts.length > 0 ? parts[0] : "";
            String last = parts.length > 1 ? parts[1] : "";

            User.UserRole roleEnum = User.UserRole.EMPLOYEE;
            if (roleClaim != null) {
                try { roleEnum = User.UserRole.valueOf(roleClaim.toUpperCase()); } catch (Exception ignored) {}
            }

            User newUser = User.builder()
                    .email(email)
                    .authId(subjectUuid)
                    .passwordHash("")
                    .firstName(first.isEmpty() ? "" : first)
                    .lastName(last.isEmpty() ? "" : last)
                    .fullName(fullName != null ? fullName : email)
                    .role(roleEnum)
                    .officeLocation(User.OfficeLocation.AUSTRALIA)
                    .isActive(true)
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .isDeleted(false)
                    .avatarUrl(avatar)
                    .build();
            return userRepository.save(newUser);
        } else {
            boolean changed = false;
            if (subjectUuid != null && !subjectUuid.equals(user.getAuthId())) { user.setAuthId(subjectUuid); changed = true; }
            if (fullName != null && !fullName.equals(user.getFullName())) { user.setFullName(fullName); changed = true; }
            if (avatar != null && !avatar.equals(user.getAvatarUrl())) { user.setAvatarUrl(avatar); changed = true; }
            if (changed) {
                user.setUpdatedAt(OffsetDateTime.now());
                return userRepository.save(user);
            }
            return user;
        }
    }
}
