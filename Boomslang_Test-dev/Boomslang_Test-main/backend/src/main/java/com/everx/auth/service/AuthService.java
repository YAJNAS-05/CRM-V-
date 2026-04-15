package com.everx.auth.service;

import com.everx.auth.dto.LoginRequest;
import com.everx.auth.dto.LoginResponse;
import com.everx.auth.dto.UserDto;
import com.everx.auth.entity.RefreshToken;
import com.everx.auth.entity.User;
import com.everx.auth.repository.RefreshTokenRepository;
import com.everx.auth.repository.UserRepository;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import com.everx.shared.util.JwtTokenProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

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

    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> EntityNotFoundException.ofEntity(User.class, "email", request.getEmail()));

        if (!user.getIsActive()) {
            throw new ValidationException("User account is not active");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ValidationException("Invalid email or password");
        }

        // Generate tokens
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
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

        User user = userRepository.findById(refreshToken.getUserId())
                .orElseThrow(() -> EntityNotFoundException.ofEntity(User.class, refreshToken.getUserId()));

        if (!user.getIsActive()) {
            throw new ValidationException("User account is not active");
        }

        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());

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
        return userRepository.findById(userId)
                .orElseThrow(() -> EntityNotFoundException.ofEntity(User.class, userId));
    }
}
