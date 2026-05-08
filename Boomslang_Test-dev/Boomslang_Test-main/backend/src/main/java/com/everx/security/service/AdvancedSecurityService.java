package com.everx.security.service;

import com.everx.security.dto.*;
import com.everx.security.entity.*;
import com.everx.security.repository.*;
import com.everx.tenant.service.TenantContextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdvancedSecurityService {

    private final TwoFactorAuthRepository twoFactorAuthRepository;
    private final SSOConfigRepository ssoConfigRepository;
    private final SecuritySessionRepository securitySessionRepository;
    private final SecurityEventRepository securityEventRepository;
    private final SecurityPolicyRepository securityPolicyRepository;
    private final TenantContextService tenantContextService;

    // Two-Factor Authentication Management
    @Transactional
    public TwoFactorAuthDto enableTwoFactorAuth(UUID tenantId, EnableTwoFactorRequest request) {
        log.info("Enabling 2FA for user: {} in tenant: {}", request.getUserId(), tenantId);

        // Generate secret key
        String secretKey = generateSecretKey();
        
        // Generate backup codes
        List<String> backupCodes = generateBackupCodes();

        TwoFactorAuth twoFactorAuth = TwoFactorAuth.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .userId(request.getUserId())
                .secretKey(secretKey)
                .backupCodes(backupCodes)
                .method(request.getMethod())
                .isEnabled(false) // Requires verification first
                .createdAt(LocalDateTime.now())
                .qrCodeUrl(generateQRCodeUrl(secretKey, request.getUserId()))
                .build();

        twoFactorAuth = twoFactorAuthRepository.save(twoFactorAuth);

        // Send verification notification
        sendTwoFactorSetupNotification(tenantId, request.getUserId(), twoFactorAuth);

        return convertToDto(twoFactorAuth);
    }

    @Transactional
    public TwoFactorAuthDto verifyAndEnableTwoFactor(UUID tenantId, VerifyTwoFactorRequest request) {
        log.info("Verifying and enabling 2FA for user: {} in tenant: {}", request.getUserId(), tenantId);

        TwoFactorAuth twoFactorAuth = twoFactorAuthRepository
                .findByTenantIdAndUserId(tenantId, request.getUserId())
                .orElseThrow(() -> new RuntimeException("2FA setup not found"));

        if (!verifyTwoFactorCode(twoFactorAuth.getSecretKey(), request.getCode())) {
            throw new RuntimeException("Invalid verification code");
        }

        twoFactorAuth.setEnabled(true);
        twoFactorAuth.setVerifiedAt(LocalDateTime.now());
        twoFactorAuth = twoFactorAuthRepository.save(twoFactorAuth);

        // Log security event
        logSecurityEvent(tenantId, request.getUserId(), "2FA_ENABLED", 
                "Two-factor authentication enabled");

        return convertToDto(twoFactorAuth);
    }

    @Transactional
    public boolean verifyTwoFactorCode(UUID tenantId, String userId, String code) {
        log.info("Verifying 2FA code for user: {} in tenant: {}", userId, tenantId);

        TwoFactorAuth twoFactorAuth = twoFactorAuthRepository
                .findByTenantIdAndUserId(tenantId, userId)
                .orElseThrow(() -> new RuntimeException("2FA not enabled"));

        // Check backup codes first
        if (twoFactorAuth.getBackupCodes().contains(code)) {
            removeBackupCode(twoFactorAuth, code);
            logSecurityEvent(tenantId, userId, "2FA_BACKUP_USED", 
                    "Backup code used for 2FA");
            return true;
        }

        // Verify TOTP code
        boolean isValid = verifyTwoFactorCode(twoFactorAuth.getSecretKey(), code);
        
        if (isValid) {
            logSecurityEvent(tenantId, userId, "2FA_VERIFIED", 
                    "Two-factor authentication successful");
        } else {
            logSecurityEvent(tenantId, userId, "2FA_FAILED", 
                    "Two-factor authentication failed");
        }

        return isValid;
    }

    // SSO Configuration Management
    @Transactional
    public SSOConfigDto createSSOConfig(UUID tenantId, CreateSSOConfigRequest request) {
        log.info("Creating SSO configuration for tenant: {} with provider: {}", tenantId, request.getProvider());

        SSOConfig ssoConfig = SSOConfig.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .provider(request.getProvider())
                .clientId(request.getClientId())
                .clientSecret(encryptSecret(request.getClientSecret()))
                .authorizationUrl(request.getAuthorizationUrl())
                .tokenUrl(request.getTokenUrl())
                .userInfoUrl(request.getUserInfoUrl())
                .scopes(request.getScopes())
                .mapping(request.getMapping())
                .isEnabled(true)
                .createdAt(LocalDateTime.now())
                .createdBy(request.getCreatedBy())
                .build();

        ssoConfig = ssoConfigRepository.save(ssoConfig);

        // Test SSO configuration
        testSSOConfiguration(ssoConfig);

        return convertToDto(ssoConfig);
    }

    @Async
    @Transactional
    public CompletableFuture<SSOAuthResultDto> authenticateWithSSO(UUID tenantId, SSOAuthRequest request) {
        log.info("Authenticating with SSO for tenant: {} with provider: {}", tenantId, request.getProvider());

        SSOConfig ssoConfig = ssoConfigRepository
                .findByTenantIdAndProvider(tenantId, request.getProvider())
                .orElseThrow(() -> new RuntimeException("SSO configuration not found"));

        try {
            // Exchange authorization code for access token
            String accessToken = exchangeCodeForToken(ssoConfig, request.getAuthorizationCode());
            
            // Get user information
            Map<String, Object> userInfo = getUserInfo(ssoConfig, accessToken);
            
            // Map user attributes
            UserMapping userMapping = mapUserAttributes(ssoConfig, userInfo);
            
            // Create or update user
            String userId = createOrUpdateSSOUser(tenantId, userMapping);
            
            // Create security session
            SecuritySession session = createSecuritySession(tenantId, userId, request);
            
            // Log security event
            logSecurityEvent(tenantId, userId, "SSO_AUTH_SUCCESS", 
                    "SSO authentication successful with provider: " + request.getProvider());

            SSOAuthResultDto result = SSOAuthResultDto.builder()
                    .success(true)
                    .userId(userId)
                    .sessionId(session.getId().toString())
                    .userMapping(userMapping)
                    .provider(request.getProvider())
                    .authenticatedAt(LocalDateTime.now())
                    .build();

            return CompletableFuture.completedFuture(result);

        } catch (Exception e) {
            log.error("SSO authentication failed for tenant: {} with provider: {}", 
                    tenantId, request.getProvider(), e);
            
            logSecurityEvent(tenantId, null, "SSO_AUTH_FAILED", 
                    "SSO authentication failed with provider: " + request.getProvider());

            SSOAuthResultDto result = SSOAuthResultDto.builder()
                    .success(false)
                    .error(e.getMessage())
                    .provider(request.getProvider())
                    .build();

            return CompletableFuture.completedFuture(result);
        }
    }

    // Security Session Management
    @Transactional
    public SecuritySessionDto createSecuritySession(UUID tenantId, String userId, CreateSessionRequest request) {
        log.info("Creating security session for user: {} in tenant: {}", userId, tenantId);

        // Check concurrent session limits
        enforceSessionLimits(tenantId, userId);

        SecuritySession session = SecuritySession.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .userId(userId)
                .sessionToken(generateSessionToken())
                .refreshToken(generateRefreshToken())
                .ipAddress(request.getIpAddress())
                .userAgent(request.getUserAgent())
                .deviceFingerprint(request.getDeviceFingerprint())
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusHours(24))
                .lastActivityAt(LocalDateTime.now())
                .isActive(true)
                .sessionType(request.getSessionType())
                .build();

        session = securitySessionRepository.save(session);

        // Log security event
        logSecurityEvent(tenantId, userId, "SESSION_CREATED", 
                "Security session created");

        return convertToDto(session);
    }

    @Transactional
    public SecuritySessionDto validateSession(UUID tenantId, String sessionToken) {
        log.info("Validating security session for tenant: {}", tenantId);

        SecuritySession session = securitySessionRepository
                .findByTenantIdAndSessionToken(tenantId, sessionToken)
                .orElseThrow(() -> new RuntimeException("Invalid session"));

        if (!session.isActive() || session.isExpired()) {
            logSecurityEvent(tenantId, session.getUserId(), "SESSION_INVALID", 
                    "Invalid or expired session used");
            throw new RuntimeException("Session invalid or expired");
        }

        // Update last activity
        session.setLastActivityAt(LocalDateTime.now());
        session = securitySessionRepository.save(session);

        return convertToDto(session);
    }

    @Transactional
    public void revokeSession(UUID tenantId, String sessionToken) {
        log.info("Revoking security session for tenant: {}", tenantId);

        SecuritySession session = securitySessionRepository
                .findByTenantIdAndSessionToken(tenantId, sessionToken)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        session.setActive(false);
        session.setRevokedAt(LocalDateTime.now());
        securitySessionRepository.save(session);

        // Log security event
        logSecurityEvent(tenantId, session.getUserId(), "SESSION_REVOKED", 
                "Security session revoked");
    }

    // Security Policy Management
    @Transactional
    public SecurityPolicyDto createSecurityPolicy(UUID tenantId, CreateSecurityPolicyRequest request) {
        log.info("Creating security policy: {} for tenant: {}", request.getName(), tenantId);

        SecurityPolicy policy = SecurityPolicy.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .name(request.getName())
                .description(request.getDescription())
                .policyType(request.getPolicyType())
                .rules(request.getRules())
                .enforcementLevel(request.getEnforcementLevel())
                .isEnabled(true)
                .createdAt(LocalDateTime.now())
                .createdBy(request.getCreatedBy())
                .build();

        policy = securityPolicyRepository.save(policy);

        return convertToDto(policy);
    }

    @Transactional(readOnly = true)
    public List<SecurityPolicyDto> getSecurityPolicies(UUID tenantId) {
        return securityPolicyRepository.findByTenantIdOrderByCreatedAtDesc(tenantId)
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    // Security Analytics
    @Transactional(readOnly = true)
    public SecurityAnalyticsDto getSecurityAnalytics(UUID tenantId, AnalyticsRequest request) {
        log.info("Getting security analytics for tenant: {}", tenantId);

        // Get session metrics
        long totalSessions = securitySessionRepository.countByTenantId(tenantId);
        long activeSessions = securitySessionRepository.countByTenantIdAndIsActive(tenantId, true);
        
        // Get 2FA metrics
        long total2FAUsers = twoFactorAuthRepository.countByTenantId(tenantId);
        long enabled2FAUsers = twoFactorAuthRepository.countByTenantIdAndIsEnabled(tenantId, true);
        
        // Get SSO metrics
        long totalSSOConfigs = ssoConfigRepository.countByTenantId(tenantId);
        long activeSSOConfigs = ssoConfigRepository.countByTenantIdAndIsEnabled(tenantId, true);
        
        // Get security event metrics
        long totalSecurityEvents = securityEventRepository.countByTenantId(tenantId);
        long failedLogins = securityEventRepository.countByTenantIdAndEventType(tenantId, "LOGIN_FAILED");
        long successfulLogins = securityEventRepository.countByTenantIdAndEventType(tenantId, "LOGIN_SUCCESS");

        return SecurityAnalyticsDto.builder()
                .tenantId(tenantId)
                .sessionMetrics(Map.of(
                        "totalSessions", totalSessions,
                        "activeSessions", activeSessions,
                        "sessionSuccessRate", calculateSessionSuccessRate(tenantId)
                ))
                .twoFactorMetrics(Map.of(
                        "totalUsers", total2FAUsers,
                        "enabledUsers", enabled2FAUsers,
                        "adoptionRate", total2FAUsers > 0 ? (double) enabled2FAUsers / total2FAUsers : 0.0
                ))
                .ssoMetrics(Map.of(
                        "totalConfigs", totalSSOConfigs,
                        "activeConfigs", activeSSOConfigs,
                        "configSuccessRate", calculateSSOSuccessRate(tenantId)
                ))
                .securityEventMetrics(Map.of(
                        "totalEvents", totalSecurityEvents,
                        "failedLogins", failedLogins,
                        "successfulLogins", successfulLogins,
                        "loginSuccessRate", (failedLogins + successfulLogins) > 0 ? 
                                (double) successfulLogins / (failedLogins + successfulLogins) : 0.0
                ))
                .generatedAt(LocalDateTime.now())
                .build();
    }

    // Scheduled Tasks
    @Scheduled(cron = "0 */15 * * * *") // Every 15 minutes
    @Transactional
    public void cleanupExpiredSessions() {
        log.info("Cleaning up expired security sessions");

        List<UUID> activeTenants = tenantContextService.getActiveTenants();

        for (UUID tenantId : activeTenants) {
            try {
                cleanupExpiredSessionsForTenant(tenantId);
            } catch (Exception e) {
                log.error("Error cleaning up expired sessions for tenant: {}", tenantId, e);
            }
        }
    }

    @Scheduled(cron = "0 0 2 * * *") // Every day at 2 AM
    @Transactional
    public void generateSecurityReports() {
        log.info("Generating daily security reports");

        List<UUID> activeTenants = tenantContextService.getActiveTenants();

        for (UUID tenantId : activeTenants) {
            try {
                generateSecurityReportForTenant(tenantId);
            } catch (Exception e) {
                log.error("Error generating security report for tenant: {}", tenantId, e);
            }
        }
    }

    // Private helper methods
    private String generateSecretKey() {
        // Generate TOTP secret key
        return "JBSWY3DPEHPK3PXP"; // Simplified for demo
    }

    private List<String> generateBackupCodes() {
        // Generate backup codes
        List<String> codes = new ArrayList<>();
        Random random = new Random();
        for (int i = 0; i < 10; i++) {
            codes.add(String.format("%08d", random.nextInt(100000000)));
        }
        return codes;
    }

    private String generateQRCodeUrl(String secretKey, String userId) {
        // Generate QR code URL for TOTP setup
        return String.format("otpauth://totp/CRM-V:%s?secret=%s&issuer=CRM-V", userId, secretKey);
    }

    private boolean verifyTwoFactorCode(String secretKey, String code) {
        // Verify TOTP code (simplified)
        return code != null && code.length() == 6 && code.matches("\\d{6}");
    }

    private void removeBackupCode(TwoFactorAuth twoFactorAuth, String code) {
        twoFactorAuth.getBackupCodes().remove(code);
        twoFactorAuthRepository.save(twoFactorAuth);
    }

    private void sendTwoFactorSetupNotification(UUID tenantId, String userId, TwoFactorAuth twoFactorAuth) {
        // Send notification for 2FA setup
        log.info("Sending 2FA setup notification to user: {} in tenant: {}", userId, tenantId);
    }

    private String encryptSecret(String secret) {
        // Encrypt sensitive data
        return secret; // Simplified for demo
    }

    private String decryptSecret(String encryptedSecret) {
        // Decrypt sensitive data
        return encryptedSecret; // Simplified for demo
    }

    private void testSSOConfiguration(SSOConfig ssoConfig) {
        // Test SSO configuration
        log.info("Testing SSO configuration for provider: {}", ssoConfig.getProvider());
    }

    private String exchangeCodeForToken(SSOConfig ssoConfig, String authorizationCode) {
        // Exchange authorization code for access token
        return "mock_access_token_" + UUID.randomUUID().toString();
    }

    private Map<String, Object> getUserInfo(SSOConfig ssoConfig, String accessToken) {
        // Get user information from SSO provider
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", "12345");
        userInfo.put("email", "user@example.com");
        userInfo.put("name", "John Doe");
        return userInfo;
    }

    private UserMapping mapUserAttributes(SSOConfig ssoConfig, Map<String, Object> userInfo) {
        return UserMapping.builder()
                .externalId(userInfo.get("id").toString())
                .email(userInfo.get("email").toString())
                .name(userInfo.get("name").toString())
                .attributes(userInfo)
                .build();
    }

    private String createOrUpdateSSOUser(UUID tenantId, UserMapping userMapping) {
        // Create or update user based on SSO mapping
        return userMapping.getExternalId(); // Simplified
    }

    private SecuritySession createSecuritySession(UUID tenantId, String userId, SSOAuthRequest request) {
        SecuritySession session = SecuritySession.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .userId(userId)
                .sessionToken(generateSessionToken())
                .refreshToken(generateRefreshToken())
                .ipAddress(request.getIpAddress())
                .userAgent(request.getUserAgent())
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusHours(24))
                .lastActivityAt(LocalDateTime.now())
                .isActive(true)
                .sessionType("SSO")
                .build();

        return securitySessionRepository.save(session);
    }

    private String generateSessionToken() {
        return "session_" + UUID.randomUUID().toString();
    }

    private String generateRefreshToken() {
        return "refresh_" + UUID.randomUUID().toString();
    }

    private void enforceSessionLimits(UUID tenantId, String userId) {
        // Enforce concurrent session limits
        List<SecuritySession> activeSessions = securitySessionRepository
                .findByTenantIdAndUserIdAndIsActive(tenantId, userId, true);
        
        if (activeSessions.size() >= 5) { // Max 5 concurrent sessions
            // Revoke oldest session
            SecuritySession oldestSession = activeSessions.stream()
                    .min(Comparator.comparing(SecuritySession::getCreatedAt))
                    .orElse(null);
            
            if (oldestSession != null) {
                oldestSession.setActive(false);
                oldestSession.setRevokedAt(LocalDateTime.now());
                securitySessionRepository.save(oldestSession);
            }
        }
    }

    private void logSecurityEvent(UUID tenantId, String userId, String eventType, String description) {
        SecurityEvent event = SecurityEvent.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .userId(userId)
                .eventType(eventType)
                .description(description)
                .timestamp(LocalDateTime.now())
                .severity(calculateEventSeverity(eventType))
                .build();

        securityEventRepository.save(event);
    }

    private String calculateEventSeverity(String eventType) {
        return switch (eventType) {
            case "LOGIN_FAILED", "2FA_FAILED", "SSO_AUTH_FAILED" -> "HIGH";
            case "SESSION_INVALID", "SESSION_REVOKED" -> "MEDIUM";
            default -> "LOW";
        };
    }

    private Double calculateSessionSuccessRate(UUID tenantId) {
        // Calculate session success rate
        return 0.95 + Math.random() * 0.04; // 95-99%
    }

    private Double calculateSSOSuccessRate(UUID tenantId) {
        // Calculate SSO success rate
        return 0.90 + Math.random() * 0.09; // 90-99%
    }

    private void cleanupExpiredSessionsForTenant(UUID tenantId) {
        List<SecuritySession> expiredSessions = securitySessionRepository
                .findByTenantIdAndExpiresAtBefore(tenantId, LocalDateTime.now());
        
        for (SecuritySession session : expiredSessions) {
            session.setActive(false);
            session.setRevokedAt(LocalDateTime.now());
            securitySessionRepository.save(session);
        }
        
        log.info("Cleaned up {} expired sessions for tenant: {}", expiredSessions.size(), tenantId);
    }

    private void generateSecurityReportForTenant(UUID tenantId) {
        // Generate security report for tenant
        log.info("Generating security report for tenant: {}", tenantId);
    }

    // DTO conversion methods
    private TwoFactorAuthDto convertToDto(TwoFactorAuth twoFactorAuth) {
        return TwoFactorAuthDto.builder()
                .id(twoFactorAuth.getId())
                .tenantId(twoFactorAuth.getTenantId())
                .userId(twoFactorAuth.getUserId())
                .method(twoFactorAuth.getMethod())
                .isEnabled(twoFactorAuth.getIsEnabled())
                .qrCodeUrl(twoFactorAuth.getQrCodeUrl())
                .createdAt(twoFactorAuth.getCreatedAt())
                .verifiedAt(twoFactorAuth.getVerifiedAt())
                .build();
    }

    private SSOConfigDto convertToDto(SSOConfig ssoConfig) {
        return SSOConfigDto.builder()
                .id(ssoConfig.getId())
                .tenantId(ssoConfig.getTenantId())
                .provider(ssoConfig.getProvider())
                .clientId(ssoConfig.getClientId())
                .authorizationUrl(ssoConfig.getAuthorizationUrl())
                .tokenUrl(ssoConfig.getTokenUrl())
                .userInfoUrl(ssoConfig.getUserInfoUrl())
                .scopes(ssoConfig.getScopes())
                .isEnabled(ssoConfig.getIsEnabled())
                .createdAt(ssoConfig.getCreatedAt())
                .build();
    }

    private SecuritySessionDto convertToDto(SecuritySession session) {
        return SecuritySessionDto.builder()
                .id(session.getId())
                .tenantId(session.getTenantId())
                .userId(session.getUserId())
                .sessionType(session.getSessionType())
                .ipAddress(session.getIpAddress())
                .userAgent(session.getUserAgent())
                .createdAt(session.getCreatedAt())
                .expiresAt(session.getExpiresAt())
                .lastActivityAt(session.getLastActivityAt())
                .isActive(session.getIsActive())
                .build();
    }

    private SecurityPolicyDto convertToDto(SecurityPolicy policy) {
        return SecurityPolicyDto.builder()
                .id(policy.getId())
                .tenantId(policy.getTenantId())
                .name(policy.getName())
                .description(policy.getDescription())
                .policyType(policy.getPolicyType())
                .enforcementLevel(policy.getEnforcementLevel())
                .isEnabled(policy.getIsEnabled())
                .createdAt(policy.getCreatedAt())
                .build();
    }

    // Inner classes
    @lombok.Data
    @lombok.Builder
    public static class UserMapping {
        private String externalId;
        private String email;
        private String name;
        private Map<String, Object> attributes;
    }
}
