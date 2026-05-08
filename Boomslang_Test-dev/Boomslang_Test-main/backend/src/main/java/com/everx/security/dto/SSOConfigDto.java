package com.everx.security.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SSOConfigDto {
    private UUID id;
    private UUID tenantId;
    private SSOProvider provider;
    private String clientId;
    private String authorizationUrl;
    private String tokenUrl;
    private String userInfoUrl;
    private Map<String, Object> scopes;
    private Boolean isEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String testStatus;
    private Long loginCount;
    private LocalDateTime lastLoginAt;
    private Long errorCount;
    private LocalDateTime lastErrorAt;

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
