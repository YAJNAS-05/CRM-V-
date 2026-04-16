package com.everx.shared.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${everx.jwt.secret:your-secret-key-change-this-in-production-minimum-512-bits-for-hs512-algorithm-safety}")
    private String jwtSecret;

    @Value("${everx.jwt.access-expiry-ms:900000}")
    private Long accessTokenExpiry;

    @Value("${everx.jwt.refresh-expiry-ms:604800000}")
    private Long refreshTokenExpiry;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(UUID userId, String email, String role) {
        List<String> roles = role == null ? List.of() : List.of(role);
        return generateToken(userId, email, roles, List.of(), accessTokenExpiry);
    }

    public String generateAccessToken(UUID userId, String email, List<String> roles, List<String> permissions) {
        return generateToken(userId, email, roles, permissions, accessTokenExpiry);
    }

    public String generateRefreshToken(UUID userId, String email) {
        return generateToken(userId, email, List.of(), List.of(), refreshTokenExpiry);
    }

    private String generateToken(UUID userId, String email, List<String> roles, List<String> permissions, Long expiryMs) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiryMs);

        JwtBuilder builder = Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512);

        if (roles != null && !roles.isEmpty()) {
            builder.claim("roles", roles);
            builder.claim("role", roles.get(0));
        }

        if (permissions != null && !permissions.isEmpty()) {
            builder.claim("permissions", permissions);
        }

        return builder.compact();
    }

    public UUID getUserIdFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return UUID.fromString(claims.getSubject());
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid token: {}", e.getMessage());
            return null;
        }
    }

    public String getEmailFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return claims.get("email", String.class);
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid token: {}", e.getMessage());
            return null;
        }
    }

    public String getRoleFromToken(String token) {
        try {
            Claims claims = getClaims(token);
            String role = claims.get("role", String.class);
            if (role != null) {
                return role;
            }

            List<String> roles = getRolesFromToken(token);
            return roles.isEmpty() ? null : roles.get(0);
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid token: {}", e.getMessage());
            return null;
        }
    }

    public List<String> getRolesFromToken(String token) {
        try {
            Claims claims = getClaims(token);
            Object value = claims.get("roles");
            if (value instanceof List<?> list) {
                List<String> roles = new ArrayList<>();
                for (Object item : list) {
                    if (item != null) {
                        roles.add(String.valueOf(item));
                    }
                }
                return roles;
            }

            String singleRole = claims.get("role", String.class);
            return singleRole == null ? List.of() : List.of(singleRole);
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid token: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public List<String> getPermissionsFromToken(String token) {
        try {
            Claims claims = getClaims(token);
            Object value = claims.get("permissions");
            if (value instanceof List<?> list) {
                List<String> permissions = new ArrayList<>();
                for (Object item : list) {
                    if (item != null) {
                        permissions.add(String.valueOf(item));
                    }
                }
                return permissions;
            }
            return List.of();
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid token: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired");
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported");
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token");
        } catch (SignatureException e) {
            log.error("JWT signature validation failed");
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty");
        }
        return false;
    }

    public Long getAccessTokenExpiry() {
        return accessTokenExpiry;
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .setSigningKey(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
