package com.everx.security.controller;

import com.everx.security.dto.*;
import com.everx.security.service.AdvancedSecurityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/security")
@RequiredArgsConstructor
@Slf4j
public class SecurityController {

    private final AdvancedSecurityService securityService;

    // Two-Factor Authentication endpoints
    @PostMapping("/2fa/enable")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<TwoFactorAuthDto> enableTwoFactorAuth(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @RequestBody EnableTwoFactorRequest request) {
        log.info("Enabling 2FA for user: {} in tenant: {}", request.getUserId(), tenantId);
        TwoFactorAuthDto result = securityService.enableTwoFactorAuth(tenantId, request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/2fa/verify")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<TwoFactorAuthDto> verifyAndEnableTwoFactor(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @RequestBody VerifyTwoFactorRequest request) {
        log.info("Verifying 2FA for user: {} in tenant: {}", request.getUserId(), tenantId);
        TwoFactorAuthDto result = securityService.verifyAndEnableTwoFactor(tenantId, request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/2fa/verify-code")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<Boolean> verifyTwoFactorCode(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @RequestParam String userId,
            @RequestParam String code) {
        log.info("Verifying 2FA code for user: {} in tenant: {}", userId, tenantId);
        boolean result = securityService.verifyTwoFactorCode(tenantId, userId, code);
        return ResponseEntity.ok(result);
    }

    // SSO Configuration endpoints
    @PostMapping("/sso/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SSOConfigDto> createSSOConfig(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @RequestBody CreateSSOConfigRequest request) {
        log.info("Creating SSO config for provider: {} in tenant: {}", request.getProvider(), tenantId);
        SSOConfigDto result = securityService.createSSOConfig(tenantId, request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/sso/authenticate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<SSOAuthResultDto> authenticateWithSSO(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @RequestBody SSOAuthRequest request) {
        log.info("SSO authentication for provider: {} in tenant: {}", request.getProvider(), tenantId);
        SSOAuthResultDto result = securityService.authenticateWithSSO(tenantId, request).join();
        return ResponseEntity.ok(result);
    }

    // Security Session endpoints
    @PostMapping("/sessions")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<SecuritySessionDto> createSecuritySession(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @RequestBody CreateSessionRequest request) {
        log.info("Creating security session in tenant: {}", tenantId);
        SecuritySessionDto result = securityService.createSecuritySession(tenantId, request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/sessions/validate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<SecuritySessionDto> validateSession(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @RequestParam String sessionToken) {
        log.info("Validating session in tenant: {}", tenantId);
        SecuritySessionDto result = securityService.validateSession(tenantId, sessionToken);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/sessions/{sessionToken}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<Void> revokeSession(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @PathVariable String sessionToken) {
        log.info("Revoking session in tenant: {}", tenantId);
        securityService.revokeSession(tenantId, sessionToken);
        return ResponseEntity.ok().build();
    }

    // Security Policy endpoints
    @PostMapping("/policies")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SecurityPolicyDto> createSecurityPolicy(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @RequestBody CreateSecurityPolicyRequest request) {
        log.info("Creating security policy: {} in tenant: {}", request.getName(), tenantId);
        SecurityPolicyDto result = securityService.createSecurityPolicy(tenantId, request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/policies")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SecurityPolicyDto>> getSecurityPolicies(
            @RequestHeader("X-Tenant-ID") UUID tenantId) {
        log.info("Getting security policies for tenant: {}", tenantId);
        List<SecurityPolicyDto> result = securityService.getSecurityPolicies(tenantId);
        return ResponseEntity.ok(result);
    }

    // Security Analytics endpoints
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SecurityAnalyticsDto> getSecurityAnalytics(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @RequestParam(required = false) String timeRange) {
        log.info("Getting security analytics for tenant: {}", tenantId);
        AnalyticsRequest request = AnalyticsRequest.builder()
                .timeRange(timeRange != null ? timeRange : "7d")
                .build();
        SecurityAnalyticsDto result = securityService.getSecurityAnalytics(tenantId, request);
        return ResponseEntity.ok(result);
    }

    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "timestamp", System.currentTimeMillis(),
                "service", "advanced-security"
        ));
    }

    // Error handling
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleError(Exception e) {
        log.error("Security controller error", e);
        return ResponseEntity.badRequest().body(Map.of(
                "error", "Security operation failed",
                "message", e.getMessage()
        ));
    }
}
