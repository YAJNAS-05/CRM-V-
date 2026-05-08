package com.everx.auth.service;

import com.everx.auth.dto.LoginRequest;
import com.everx.auth.dto.LoginResponse;
import com.everx.auth.dto.UserDto;
import com.everx.auth.entity.RefreshToken;
import com.everx.auth.entity.User;
import com.everx.auth.repository.RefreshTokenRepository;
import com.everx.auth.repository.UserRepository;
import com.everx.backend.auth.service.AccountLockoutService;
import com.everx.shared.exception.AuthenticationException;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import com.everx.shared.util.JwtTokenProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.stream.Stream;

@Service
@Slf4j
@Transactional
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AccountLockoutService accountLockoutService;

    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        User user = userRepository.findByEmailWithRolesAndPermissions(request.getEmail())
                .orElseThrow(() -> new ValidationException("Invalid email or password"));

        if (!user.getIsActive()) {
            throw new ValidationException("User account is not active");
        }

        accountLockoutService.checkAndThrowIfLocked(user.getId());

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            accountLockoutService.recordFailedAttempt(user.getId());
            throw AuthenticationException.invalidCredentials();
        }

        accountLockoutService.recordSuccessfulLogin(user.getId());

        // Generate tokens
        List<String> tokenRoles = extractRoles(user);
        List<String> tokenPermissions = extractPermissions(user);
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), tokenRoles, tokenPermissions);
        String refreshTokenStr = jwtTokenProvider.generateRefreshToken(user.getId(), user.getEmail());

        // Save refresh token to database
        RefreshToken refreshToken = RefreshToken.builder()
                .userId(user.getId())
                .token(refreshTokenStr)
                .expiresAt(OffsetDateTime.now().plusDays(7))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);

        // Update last login
        user.setLastLogin(OffsetDateTime.now());
        userRepository.save(user);

        log.info("Login successful for user: {}", user.getEmail());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessTokenExpiry() / 1000)
                .user(UserDto.fromEntity(user))
                .build();
    }

    public LoginResponse refreshAccessToken(String refreshTokenStr) {
        log.info("Refreshing access token");

        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenStr)
                .orElseThrow(() -> new ValidationException("Invalid refresh token"));

        if (refreshToken.getRevoked() || refreshToken.isExpired() || refreshToken.getIsDeleted()) {
            throw new ValidationException("Refresh token is invalid or expired");
        }

        User user = userRepository.findByIdWithRolesAndPermissions(refreshToken.getUserId())
                .orElseThrow(() -> EntityNotFoundException.ofEntity(User.class, refreshToken.getUserId()));

        if (!user.getIsActive()) {
            throw new ValidationException("User account is not active");
        }

        String newAccessToken = jwtTokenProvider.generateAccessToken(
            user.getId(),
            user.getEmail(),
            extractRoles(user),
            extractPermissions(user)
        );

        log.info("Token refreshed successfully for user: {}", user.getEmail());

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshTokenStr)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessTokenExpiry() / 1000)
                .user(UserDto.fromEntity(user))
                .build();
    }

    public void logout(String refreshTokenStr) {
        log.info("Logout attempt");

        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenStr)
                .orElseThrow(() -> new ValidationException("Invalid refresh token"));

        refreshToken.revoke();
        refreshTokenRepository.save(refreshToken);

        log.info("Logout successful");
    }

    public User getCurrentUser(UUID userId) {
        return userRepository.findByIdWithRolesAndPermissions(userId)
                .orElseThrow(() -> EntityNotFoundException.ofEntity(User.class, userId));
    }

    private List<String> extractRoles(User user) {
        List<String> assignedRoleNames = user.getAssignedRoles() == null
            ? List.of()
            : user.getAssignedRoles().stream()
            .filter(role -> role != null
                && Boolean.TRUE.equals(role.getIsActive())
                && !Boolean.TRUE.equals(role.getIsDeleted())
                && role.getName() != null
                && !role.getName().isBlank())
            .map(com.everx.auth.entity.Role::getName)
            .distinct()
            .sorted()
            .toList();

        if (!assignedRoleNames.isEmpty()) {
            return assignedRoleNames;
        }

        if (user.getRole() != null) {
            return List.of(user.getRole().name());
        }

        return List.of();
    }

    private List<String> extractPermissions(User user) {
        return (user.getAssignedRoles() == null ? Stream.<com.everx.auth.entity.Permission>empty() : user.getAssignedRoles().stream()
            .filter(role -> role != null
                && Boolean.TRUE.equals(role.getIsActive())
                && !Boolean.TRUE.equals(role.getIsDeleted()))
            .flatMap(role -> role.getPermissions() == null
                ? Stream.<com.everx.auth.entity.Permission>empty()
                : role.getPermissions().stream()))
            .filter(permission -> permission != null
                && Boolean.TRUE.equals(permission.getIsActive())
                && !Boolean.TRUE.equals(permission.getIsDeleted())
                && permission.getPermissionKey() != null
                && !permission.getPermissionKey().isBlank())
            .map(com.everx.auth.entity.Permission::getPermissionKey)
                .distinct()
                .sorted()
                .toList();
    }
}
