package com.everx.api.controller;

import com.everx.shared.dto.ApiResponse;
import com.everx.api.dto.*;
import com.everx.api.service.ApiManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/api-management")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "API Management", description = "APIs for managing API keys and usage tracking")
public class ApiManagementController {

    private final ApiManagementService apiManagementService;

    @PostMapping("/keys")
    @Operation(summary = "Create API key", description = "Creates a new API key for a tenant")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canManageTenant(authentication.name, #request.tenantId)")
    public ResponseEntity<ApiResponse<ApiKeyDto>> createApiKey(
            @Valid @RequestBody CreateApiKeyRequest request) {
        
        log.info("Creating API key for tenant: {}", request.getTenantId());
        ApiKeyDto apiKey = apiManagementService.createApiKey(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(apiKey, "API key created successfully"));
    }

    @GetMapping("/keys/{apiKeyId}")
    @Operation(summary = "Get API key by ID", description = "Retrieves API key details by ID")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canAccessTenant(authentication.name, #apiKeyId)")
    public ResponseEntity<ApiResponse<ApiKeyDto>> getApiKey(
            @Parameter(description = "API Key ID") @PathVariable UUID apiKeyId) {
        
        ApiKeyDto apiKey = apiManagementService.getApiKeyById(apiKeyId);
        return ResponseEntity.ok(ApiResponse.success(apiKey));
    }

    @PutMapping("/keys/{apiKeyId}")
    @Operation(summary = "Update API key", description = "Updates an existing API key")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canManageTenant(authentication.name, #apiKeyId)")
    public ResponseEntity<ApiResponse<ApiKeyDto>> updateApiKey(
            @Parameter(description = "API Key ID") @PathVariable UUID apiKeyId,
            @Valid @RequestBody UpdateApiKeyRequest request) {
        
        log.info("Updating API key: {}", apiKeyId);
        ApiKeyDto apiKey = apiManagementService.updateApiKey(apiKeyId, request);
        return ResponseEntity.ok(ApiResponse.success(apiKey, "API key updated successfully"));
    }

    @PostMapping("/keys/{apiKeyId}/revoke")
    @Operation(summary = "Revoke API key", description = "Revokes an API key")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canManageTenant(authentication.name, #apiKeyId)")
    public ResponseEntity<ApiResponse<Void>> revokeApiKey(
            @Parameter(description = "API Key ID") @PathVariable UUID apiKeyId,
            @Parameter(description = "Revocation reason") @RequestParam String reason) {
        
        log.warn("Revoking API key: {} with reason: {}", apiKeyId, reason);
        apiManagementService.revokeApiKey(apiKeyId, reason);
        return ResponseEntity.ok(ApiResponse.success(null, "API key revoked successfully"));
    }

    @DeleteMapping("/keys/{apiKeyId}")
    @Operation(summary = "Delete API key", description = "Deletes an API key permanently")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteApiKey(
            @Parameter(description = "API Key ID") @PathVariable UUID apiKeyId) {
        
        log.warn("Deleting API key: {}", apiKeyId);
        apiManagementService.deleteApiKey(apiKeyId);
        return ResponseEntity.ok(ApiResponse.success(null, "API key deleted successfully"));
    }

    @GetMapping("/keys")
    @Operation(summary = "Get all API keys", description = "Retrieves paginated list of all API keys")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ApiKeyDto>>> getAllApiKeys(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sort,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String direction) {
        
        Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? 
                Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
        
        Page<ApiKeyDto> apiKeys = apiManagementService.getAllApiKeys(pageable);
        return ResponseEntity.ok(ApiResponse.success(apiKeys));
    }

    @GetMapping("/keys/tenant/{tenantId}")
    @Operation(summary = "Get API keys by tenant", description = "Retrieves API keys for a specific tenant")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canAccessTenant(authentication.name, #tenantId)")
    public ResponseEntity<ApiResponse<List<ApiKeyDto>>> getApiKeysByTenant(
            @Parameter(description = "Tenant ID") @PathVariable UUID tenantId) {
        
        List<ApiKeyDto> apiKeys = apiManagementService.getApiKeysByTenant(tenantId);
        return ResponseEntity.ok(ApiResponse.success(apiKeys));
    }

    @GetMapping("/keys/search")
    @Operation(summary = "Search API keys", description = "Searches API keys by name or description")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ApiKeyDto>>> searchApiKeys(
            @Parameter(description = "Search query") @RequestParam String search,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ApiKeyDto> apiKeys = apiManagementService.searchApiKeys(search, pageable);
        return ResponseEntity.ok(ApiResponse.success(apiKeys));
    }

    @PostMapping("/usage")
    @Operation(summary = "Record API usage", description = "Records API usage for tracking")
    public ResponseEntity<ApiResponse<Void>> recordApiUsage(
            @Valid @RequestBody ApiUsageRecordRequest request) {
        
        apiManagementService.recordApiUsage(request);
        return ResponseEntity.ok(ApiResponse.success(null, "API usage recorded successfully"));
    }

    @GetMapping("/usage/tenant/{tenantId}")
    @Operation(summary = "Get API usage by tenant", description = "Retrieves API usage for a specific tenant")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canAccessTenant(authentication.name, #tenantId)")
    public ResponseEntity<ApiResponse<Page<ApiUsageDto>>> getApiUsageByTenant(
            @Parameter(description = "Tenant ID") @PathVariable UUID tenantId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        Page<ApiUsageDto> usage = apiManagementService.getApiUsage(tenantId, pageable);
        return ResponseEntity.ok(ApiResponse.success(usage));
    }

    @GetMapping("/usage/key/{apiKeyId}")
    @Operation(summary = "Get API usage by key", description = "Retrieves API usage for a specific API key")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canAccessTenant(authentication.name, #apiKeyId)")
    public ResponseEntity<ApiResponse<Page<ApiUsageDto>>> getApiUsageByKey(
            @Parameter(description = "API Key ID") @PathVariable UUID apiKeyId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        Page<ApiUsageDto> usage = apiManagementService.getApiUsageByKey(apiKeyId, pageable);
        return ResponseEntity.ok(ApiResponse.success(usage));
    }

    @GetMapping("/usage/stats/{tenantId}")
    @Operation(summary = "Get API usage statistics", description = "Retrieves API usage statistics for a tenant")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN') or @tenantSecurityService.canAccessTenant(authentication.name, #tenantId)")
    public ResponseEntity<ApiResponse<ApiUsageStatsDto>> getApiUsageStats(
            @Parameter(description = "Tenant ID") @PathVariable UUID tenantId,
            @Parameter(description = "Start date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "End date") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        ApiUsageStatsDto stats = apiManagementService.getApiUsageStats(tenantId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @PostMapping("/cleanup/expired-keys")
    @Operation(summary = "Cleanup expired API keys", description = "Deactivates expired API keys")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> cleanupExpiredApiKeys() {
        log.info("Cleaning up expired API keys");
        apiManagementService.cleanupExpiredApiKeys();
        return ResponseEntity.ok(ApiResponse.success(null, "Expired API keys cleaned up successfully"));
    }

    @PostMapping("/cleanup/old-usage")
    @Operation(summary = "Cleanup old usage records", description = "Deletes old API usage records")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> cleanupOldApiUsage() {
        log.info("Cleaning up old API usage records");
        apiManagementService.cleanupOldApiUsage();
        return ResponseEntity.ok(ApiResponse.success(null, "Old API usage records cleaned up successfully"));
    }
}
