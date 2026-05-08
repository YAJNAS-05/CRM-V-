package com.everx.integration.controller;

import com.everx.integration.dto.*;
import com.everx.integration.service.EnterpriseIntegrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/v1/integration")
@RequiredArgsConstructor
@Slf4j
public class IntegrationController {

    private final EnterpriseIntegrationService integrationService;

    // Integration Configuration endpoints
    @PostMapping("/configs")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INTEGRATION_MANAGER')")
    public ResponseEntity<IntegrationConfigDto> createIntegrationConfig(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @RequestBody CreateIntegrationConfigRequest request) {
        log.info("Creating integration config: {} for tenant: {}", request.getName(), tenantId);
        IntegrationConfigDto result = integrationService.createIntegrationConfig(tenantId, request);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/configs/{configId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INTEGRATION_MANAGER')")
    public ResponseEntity<IntegrationConfigDto> updateIntegrationConfig(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @PathVariable UUID configId,
            @RequestBody CreateIntegrationConfigRequest request) {
        log.info("Updating integration config: {} for tenant: {}", configId, tenantId);
        IntegrationConfigDto result = integrationService.updateIntegrationConfig(tenantId, configId, request);
        return ResponseEntity.ok(result);
    }

    // Integration Execution endpoints
    @PostMapping("/execute")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INTEGRATION_MANAGER')")
    public CompletableFuture<IntegrationExecutionDto> executeIntegration(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @RequestBody ExecuteIntegrationRequest request) {
        log.info("Executing integration for config: {} in tenant: {}", request.getConfigId(), tenantId);
        return integrationService.executeIntegration(tenantId, request);
    }

    // Data Mapping endpoints
    @PostMapping("/mappings")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INTEGRATION_MANAGER')")
    public ResponseEntity<DataMappingDto> createDataMapping(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @RequestBody CreateDataMappingRequest request) {
        log.info("Creating data mapping: {} for tenant: {}", request.getName(), tenantId);
        DataMappingDto result = integrationService.createDataMapping(tenantId, request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/transform")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INTEGRATION_MANAGER')")
    public ResponseEntity<Object> transformData(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @RequestParam UUID mappingId,
            @RequestBody Object data) {
        log.info("Transforming data with mapping: {} in tenant: {}", mappingId, tenantId);
        Object result = integrationService.transformData(tenantId, mappingId, data);
        return ResponseEntity.ok(result);
    }

    // External System endpoints
    @PostMapping("/systems")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INTEGRATION_MANAGER')")
    public ResponseEntity<ExternalSystemDto> createExternalSystem(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @RequestBody CreateExternalSystemRequest request) {
        log.info("Creating external system: {} for tenant: {}", request.getName(), tenantId);
        ExternalSystemDto result = integrationService.createExternalSystem(tenantId, request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/systems/{systemId}/health")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INTEGRATION_MANAGER')")
    public ResponseEntity<SystemHealthDto> checkSystemHealth(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @PathVariable UUID systemId) {
        log.info("Checking health for system: {} in tenant: {}", systemId, tenantId);
        SystemHealthDto result = integrationService.checkSystemHealth(tenantId, systemId);
        return ResponseEntity.ok(result);
    }

    // Analytics endpoints
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INTEGRATION_MANAGER')")
    public ResponseEntity<IntegrationAnalyticsDto> getIntegrationAnalytics(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @RequestParam(required = false) String timeRange) {
        log.info("Getting integration analytics for tenant: {}", tenantId);
        AnalyticsRequest request = AnalyticsRequest.builder()
                .timeRange(timeRange != null ? timeRange : "7d")
                .build();
        IntegrationAnalyticsDto result = integrationService.getIntegrationAnalytics(tenantId, request);
        return ResponseEntity.ok(result);
    }

    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "timestamp", System.currentTimeMillis(),
                "service", "enterprise-integration"
        ));
    }

    // Error handling
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleError(Exception e) {
        log.error("Integration controller error", e);
        return ResponseEntity.badRequest().body(Map.of(
                "error", "Integration operation failed",
                "message", e.getMessage()
        ));
    }
}
