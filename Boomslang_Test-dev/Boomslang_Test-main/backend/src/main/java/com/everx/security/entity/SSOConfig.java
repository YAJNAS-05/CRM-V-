package com.everx.security.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "sso_config")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SSOConfig {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false)
    private SSOProvider provider;

    @Column(name = "client_id", nullable = false)
    private String clientId;

    @Column(name = "client_secret", nullable = false)
    private String clientSecret;

    @Column(name = "authorization_url", nullable = false)
    private String authorizationUrl;

    @Column(name = "token_url", nullable = false)
    private String tokenUrl;

    @Column(name = "user_info_url", nullable = false)
    private String userInfoUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "scopes")
    private Map<String, Object> scopes;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "mapping")
    private Map<String, Object> mapping;

    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "last_tested_at")
    private LocalDateTime lastTestedAt;

    @Column(name = "test_status")
    private String testStatus;

    @Column(name = "test_message")
    private String testMessage;

    @Column(name = "login_count")
    private Long loginCount;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "error_count")
    private Long errorCount;

    @Column(name = "last_error_at")
    private LocalDateTime lastErrorAt;

    @Column(name = "last_error_message")
    private String lastErrorMessage;

    // Helper methods
    public boolean isHealthy() {
        return "SUCCESS".equals(testStatus) && lastTestedAt != null && 
               lastTestedAt.isAfter(LocalDateTime.now().minusHours(24));
    }

    public void recordSuccessfulLogin() {
        this.loginCount = (this.loginCount == null ? 0L : this.loginCount) + 1;
        this.lastLoginAt = LocalDateTime.now();
        // Reset error count on successful login
        this.errorCount = 0L;
        this.lastErrorAt = null;
        this.lastErrorMessage = null;
    }

    public void recordError(String errorMessage) {
        this.errorCount = (this.errorCount == null ? 0L : this.errorCount) + 1;
        this.lastErrorAt = LocalDateTime.now();
        this.lastErrorMessage = errorMessage;
    }

    public void updateTestResult(String status, String message) {
        this.lastTestedAt = LocalDateTime.now();
        this.testStatus = status;
        this.testMessage = message;
    }

    public double getSuccessRate() {
        if (loginCount == null || loginCount == 0) return 0.0;
        long totalAttempts = loginCount + (errorCount == null ? 0 : errorCount);
        return totalAttempts > 0 ? (double) loginCount / totalAttempts : 0.0;
    }

    public boolean hasRecentErrors() {
        return lastErrorAt != null && lastErrorAt.isAfter(LocalDateTime.now().minusHours(1));
    }

    public enum SSOProvider {
        GOOGLE,
        MICROSOFT,
        AZURE_AD,
        OKTA,
        AUTH0,
        SAML,
        LDAP,
        CUSTOM_OIDC
    }
}
