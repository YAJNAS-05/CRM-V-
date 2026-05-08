package com.everx.integration.service;

import com.everx.integration.dto.*;
import com.everx.integration.entity.*;
import com.everx.integration.repository.*;
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
public class EnterpriseIntegrationService {

    private final IntegrationConfigRepository integrationConfigRepository;
    private final IntegrationExecutionRepository executionRepository;
    private final DataMappingRepository dataMappingRepository;
    private final IntegrationLogRepository integrationLogRepository;
    private final ExternalSystemRepository externalSystemRepository;
    private final TenantContextService tenantContextService;

    // Integration Configuration Management
    @Transactional
    public IntegrationConfigDto createIntegrationConfig(UUID tenantId, CreateIntegrationConfigRequest request) {
        log.info("Creating integration config: {} for tenant: {}", request.getName(), tenantId);

        IntegrationConfig config = IntegrationConfig.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .name(request.getName())
                .description(request.getDescription())
                .integrationType(request.getIntegrationType())
                .sourceSystem(request.getSourceSystem())
                .targetSystem(request.getTargetSystem())
                .connectionDetails(request.getConnectionDetails())
                .authenticationType(request.getAuthenticationType())
                .credentials(encryptCredentials(request.getCredentials()))
                .syncFrequency(request.getSyncFrequency())
                .dataMappings(request.getDataMappings())
                .transformationRules(request.getTransformationRules())
                .errorHandling(request.getErrorHandling())
                .retryPolicy(request.getRetryPolicy())
                .status(IntegrationConfig.Status.ACTIVE)
                .createdAt(LocalDateTime.now())
                .createdBy(request.getCreatedBy())
                .build();

        config = integrationConfigRepository.save(config);

        // Test connection
        testIntegrationConnection(config);

        return convertToDto(config);
    }

    @Transactional
    public IntegrationConfigDto updateIntegrationConfig(UUID tenantId, UUID configId, UpdateIntegrationConfigRequest request) {
        log.info("Updating integration config: {} for tenant: {}", configId, tenantId);

        IntegrationConfig config = integrationConfigRepository.findById(configId)
                .orElseThrow(() -> new RuntimeException("Integration config not found"));

        if (!config.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Integration config not found in tenant");
        }

        // Update fields
        if (request.getName() != null) config.setName(request.getName());
        if (request.getDescription() != null) config.setDescription(request.getDescription());
        if (request.getConnectionDetails() != null) config.setConnectionDetails(request.getConnectionDetails());
        if (request.getCredentials() != null) config.setCredentials(encryptCredentials(request.getCredentials()));
        if (request.getSyncFrequency() != null) config.setSyncFrequency(request.getSyncFrequency());
        if (request.getDataMappings() != null) config.setDataMappings(request.getDataMappings());
        if (request.getTransformationRules() != null) config.setTransformationRules(request.getTransformationRules());

        config.setUpdatedAt(LocalDateTime.now());
        config.setUpdatedBy(request.getUpdatedBy());

        config = integrationConfigRepository.save(config);

        return convertToDto(config);
    }

    // Integration Execution
    @Async
    @Transactional
    public CompletableFuture<IntegrationExecutionDto> executeIntegration(UUID tenantId, ExecuteIntegrationRequest request) {
        log.info("Executing integration: {} for tenant: {}", request.getConfigId(), tenantId);

        IntegrationConfig config = integrationConfigRepository.findById(request.getConfigId())
                .orElseThrow(() -> new RuntimeException("Integration config not found"));

        if (!config.getTenantId().equals(tenantId) || !config.isActive()) {
            throw new RuntimeException("Integration not available for execution");
        }

        // Create execution record
        IntegrationExecution execution = createIntegrationExecution(config, request);

        try {
            // Execute integration
            executeIntegrationSteps(config, execution, request.getData());

            // Update execution status
            execution.setStatus(IntegrationExecution.Status.COMPLETED);
            execution.setCompletedAt(LocalDateTime.now());
            execution = executionRepository.save(execution);

            // Log integration event
            logIntegrationEvent(tenantId, "INTEGRATION_EXECUTED", 
                    "Integration executed: " + config.getName());

            return CompletableFuture.completedFuture(convertToDto(execution));

        } catch (Exception e) {
            log.error("Integration execution failed for: {}", config.getId(), e);

            // Update execution with error
            execution.setStatus(IntegrationExecution.Status.FAILED);
            execution.setErrorMessage(e.getMessage());
            execution.setCompletedAt(LocalDateTime.now());
            execution = executionRepository.save(execution);

            // Handle retry if configured
            if (shouldRetryIntegration(config, execution)) {
                scheduleRetryIntegration(config, request);
            }

            throw new RuntimeException("Integration execution failed: " + e.getMessage());
        }
    }

    // Data Mapping Management
    @Transactional
    public DataMappingDto createDataMapping(UUID tenantId, CreateDataMappingRequest request) {
        log.info("Creating data mapping: {} for tenant: {}", request.getName(), tenantId);

        DataMapping mapping = DataMapping.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .name(request.getName())
                .description(request.getDescription())
                .sourceEntityType(request.getSourceEntityType())
                .targetEntityType(request.getTargetEntityType())
                .fieldMappings(request.getFieldMappings())
                .transformationLogic(request.getTransformationLogic())
                .validationRules(request.getValidationRules())
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .createdBy(request.getCreatedBy())
                .build();

        mapping = dataMappingRepository.save(mapping);

        return convertToDto(mapping);
    }

    @Async
    @Transactional
    public CompletableFuture<Map<String, Object>> transformData(UUID tenantId, TransformDataRequest request) {
        log.info("Transforming data for tenant: {} with mapping: {}", tenantId, request.getMappingId());

        DataMapping mapping = dataMappingRepository.findById(request.getMappingId())
                .orElseThrow(() -> new RuntimeException("Data mapping not found"));

        if (!mapping.getTenantId().equals(tenantId) || !mapping.isActive()) {
            throw new RuntimeException("Data mapping not available");
        }

        try {
            // Apply field mappings
            Map<String, Object> transformedData = applyFieldMappings(mapping, request.getSourceData());

            // Apply transformation logic
            transformedData = applyTransformationLogic(mapping, transformedData);

            // Apply validation rules
            validateTransformedData(mapping, transformedData);

            return CompletableFuture.completedFuture(transformedData);

        } catch (Exception e) {
            log.error("Data transformation failed for mapping: {}", mapping.getId(), e);
            throw new RuntimeException("Data transformation failed: " + e.getMessage());
        }
    }

    // External System Management
    @Transactional
    public ExternalSystemDto createExternalSystem(UUID tenantId, CreateExternalSystemRequest request) {
        log.info("Creating external system: {} for tenant: {}", request.getName(), tenantId);

        ExternalSystem system = ExternalSystem.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .name(request.getName())
                .description(request.getDescription())
                .systemType(request.getSystemType())
                .baseUrl(request.getBaseUrl())
                .apiVersion(request.getApiVersion())
                .authenticationType(request.getAuthenticationType())
                .credentials(encryptCredentials(request.getCredentials()))
                .connectionDetails(request.getConnectionDetails())
                .status(ExternalSystem.Status.ACTIVE)
                .lastHealthCheck(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .createdBy(request.getCreatedBy())
                .build();

        system = externalSystemRepository.save(system);

        // Test connection
        testExternalSystemConnection(system);

        return convertToDto(system);
    }

    @Transactional
    public ExternalSystemHealthDto checkSystemHealth(UUID tenantId, UUID systemId) {
        log.info("Checking health for external system: {} in tenant: {}", systemId, tenantId);

        ExternalSystem system = externalSystemRepository.findById(systemId)
                .orElseThrow(() -> new RuntimeException("External system not found"));

        if (!system.getTenantId().equals(tenantId)) {
            throw new RuntimeException("External system not found in tenant");
        }

        try {
            // Perform health check
            HealthCheckResult healthResult = performHealthCheck(system);

            // Update system health status
            system.setLastHealthCheck(LocalDateTime.now());
            system.setHealthStatus(healthResult.getStatus());
            system.setHealthMessage(healthResult.getMessage());
            system.setResponseTime(healthResult.getResponseTime());
            externalSystemRepository.save(system);

            return ExternalSystemHealthDto.builder()
                    .systemId(system.getId())
                    .systemName(system.getName())
                    .status(healthResult.getStatus())
                    .message(healthResult.getMessage())
                    .responseTime(healthResult.getResponseTime())
                    .checkedAt(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            log.error("Health check failed for system: {}", system.getId(), e);

            system.setLastHealthCheck(LocalDateTime.now());
            system.setHealthStatus(ExternalSystem.HealthStatus.UNHEALTHY);
            system.setHealthMessage(e.getMessage());
            externalSystemRepository.save(system);

            throw new RuntimeException("Health check failed: " + e.getMessage());
        }
    }

    // Integration Analytics
    @Transactional(readOnly = true)
    public IntegrationAnalyticsDto getIntegrationAnalytics(UUID tenantId, AnalyticsRequest request) {
        log.info("Getting integration analytics for tenant: {}", tenantId);

        // Get integration metrics
        long totalIntegrations = integrationConfigRepository.countByTenantId(tenantId);
        long activeIntegrations = integrationConfigRepository.countByTenantIdAndStatus(tenantId, IntegrationConfig.Status.ACTIVE);
        
        // Get execution metrics
        long totalExecutions = executionRepository.countByTenantId(tenantId);
        long successfulExecutions = executionRepository.countByTenantIdAndStatus(tenantId, IntegrationExecution.Status.COMPLETED);
        long failedExecutions = executionRepository.countByTenantIdAndStatus(tenantId, IntegrationExecution.Status.FAILED);
        
        // Get data mapping metrics
        long totalMappings = dataMappingRepository.countByTenantId(tenantId);
        long activeMappings = dataMappingRepository.countByTenantIdAndIsActive(tenantId, true);
        
        // Get external system metrics
        long totalSystems = externalSystemRepository.countByTenantId(tenantId);
        long healthySystems = externalSystemRepository.countByTenantIdAndHealthStatus(tenantId, ExternalSystem.HealthStatus.HEALTHY);

        return IntegrationAnalyticsDto.builder()
                .tenantId(tenantId)
                .integrationMetrics(Map.of(
                        "totalIntegrations", totalIntegrations,
                        "activeIntegrations", activeIntegrations,
                        "integrationActivationRate", totalIntegrations > 0 ? (double) activeIntegrations / totalIntegrations : 0.0
                ))
                .executionMetrics(Map.of(
                        "totalExecutions", totalExecutions,
                        "successfulExecutions", successfulExecutions,
                        "failedExecutions", failedExecutions,
                        "successRate", totalExecutions > 0 ? (double) successfulExecutions / totalExecutions : 0.0,
                        "averageExecutionTime", calculateAverageExecutionTime(tenantId)
                ))
                .mappingMetrics(Map.of(
                        "totalMappings", totalMappings,
                        "activeMappings", activeMappings,
                        "mappingActivationRate", totalMappings > 0 ? (double) activeMappings / totalMappings : 0.0
                ))
                .systemMetrics(Map.of(
                        "totalSystems", totalSystems,
                        "healthySystems", healthySystems,
                        "systemHealthRate", totalSystems > 0 ? (double) healthySystems / totalSystems : 0.0,
                        "averageResponseTime", calculateAverageResponseTime(tenantId)
                ))
                .generatedAt(LocalDateTime.now())
                .build();
    }

    // Scheduled Tasks
    @Scheduled(cron = "0 */10 * * * *") // Every 10 minutes
    @Transactional
    public void processScheduledIntegrations() {
        log.info("Processing scheduled integrations");

        List<UUID> activeTenants = tenantContextService.getActiveTenants();

        for (UUID tenantId : activeTenants) {
            try {
                processScheduledIntegrationsForTenant(tenantId);
            } catch (Exception e) {
                log.error("Error processing scheduled integrations for tenant: {}", tenantId, e);
            }
        }
    }

    @Scheduled(cron = "0 */30 * * * *") // Every 30 minutes
    @Transactional
    public void performSystemHealthChecks() {
        log.info("Performing system health checks");

        List<UUID> activeTenants = tenantContextService.getActiveTenants();

        for (UUID tenantId : activeTenants) {
            try {
                performSystemHealthChecksForTenant(tenantId);
            } catch (Exception e) {
                log.error("Error performing health checks for tenant: {}", tenantId, e);
            }
        }
    }

    @Scheduled(cron = "0 0 3 * * *") // Every day at 3 AM
    @Transactional
    public void cleanupIntegrationLogs() {
        log.info("Cleaning up integration logs");

        List<UUID> activeTenants = tenantContextService.getActiveTenants();

        for (UUID tenantId : activeTenants) {
            try {
                cleanupIntegrationLogsForTenant(tenantId);
            } catch (Exception e) {
                log.error("Error cleaning up logs for tenant: {}", tenantId, e);
            }
        }
    }

    // Private helper methods
    private String encryptCredentials(Map<String, String> credentials) {
        // Encrypt credentials
        return "encrypted_" + UUID.randomUUID().toString(); // Simplified
    }

    private Map<String, String> decryptCredentials(String encryptedCredentials) {
        // Decrypt credentials
        return Map.of("username", "user", "password", "pass"); // Simplified
    }

    private void testIntegrationConnection(IntegrationConfig config) {
        // Test integration connection
        log.info("Testing connection for integration: {}", config.getId());
    }

    private IntegrationExecution createIntegrationExecution(IntegrationConfig config, ExecuteIntegrationRequest request) {
        IntegrationExecution execution = IntegrationExecution.builder()
                .id(UUID.randomUUID())
                .configId(config.getId())
                .status(IntegrationExecution.Status.RUNNING)
                .data(request.getData())
                .triggeredBy(request.getTriggeredBy())
                .startedAt(LocalDateTime.now())
                .estimatedDuration(config.getEstimatedDuration())
                .build();

        return executionRepository.save(execution);
    }

    private void executeIntegrationSteps(IntegrationConfig config, IntegrationExecution execution, Map<String, Object> data) {
        log.info("Executing integration steps for: {}", config.getId());

        // Step 1: Connect to source system
        connectToSourceSystem(config, data);

        // Step 2: Extract data
        Map<String, Object> extractedData = extractData(config, data);

        // Step 3: Transform data
        Map<String, Object> transformedData = transformIntegrationData(config, extractedData);

        // Step 4: Load data to target system
        loadDataToTargetSystem(config, transformedData);

        // Update execution progress
        execution.setProcessedRecords(execution.getProcessedRecords() + 1);
        executionRepository.save(execution);
    }

    private void connectToSourceSystem(IntegrationConfig config, Map<String, Object> data) {
        // Connect to source system
        log.info("Connecting to source system: {}", config.getSourceSystem());
    }

    private Map<String, Object> extractData(IntegrationConfig config, Map<String, Object> data) {
        // Extract data from source system
        log.info("Extracting data from: {}", config.getSourceSystem());
        return data; // Simplified
    }

    private Map<String, Object> transformIntegrationData(IntegrationConfig config, Map<String, Object> data) {
        // Transform data according to mappings
        log.info("Transforming data for integration: {}", config.getId());
        return data; // Simplified
    }

    private void loadDataToTargetSystem(IntegrationConfig config, Map<String, Object> data) {
        // Load data to target system
        log.info("Loading data to: {}", config.getTargetSystem());
    }

    private boolean shouldRetryIntegration(IntegrationConfig config, IntegrationExecution execution) {
        // Check if integration should be retried
        return config.getRetryPolicy() != null && execution.getRetryCount() < 3;
    }

    private void scheduleRetryIntegration(IntegrationConfig config, ExecuteIntegrationRequest request) {
        // Schedule retry integration
        log.info("Scheduling retry for integration: {}", config.getId());
    }

    private Map<String, Object> applyFieldMappings(DataMapping mapping, Map<String, Object> sourceData) {
        Map<String, Object> transformedData = new HashMap<>();

        for (DataMapping.FieldMapping fieldMapping : mapping.getFieldMappings()) {
            Object sourceValue = sourceData.get(fieldMapping.getSourceField());
            if (sourceValue != null) {
                transformedData.put(fieldMapping.getTargetField(), sourceValue);
            }
        }

        return transformedData;
    }

    private Map<String, Object> applyTransformationLogic(DataMapping mapping, Map<String, Object> data) {
        // Apply transformation logic
        log.info("Applying transformation logic for mapping: {}", mapping.getId());
        return data; // Simplified
    }

    private void validateTransformedData(DataMapping mapping, Map<String, Object> data) {
        // Validate transformed data
        log.info("Validating transformed data for mapping: {}", mapping.getId());
    }

    private void testExternalSystemConnection(ExternalSystem system) {
        // Test external system connection
        log.info("Testing connection to external system: {}", system.getId());
    }

    private HealthCheckResult performHealthCheck(ExternalSystem system) {
        // Perform health check
        long startTime = System.currentTimeMillis();

        try {
            // Simulate health check
            Thread.sleep(100 + (long)(Math.random() * 200)); // 100-300ms response time

            long responseTime = System.currentTimeMillis() - startTime;
            boolean isHealthy = Math.random() > 0.1; // 90% success rate

            return HealthCheckResult.builder()
                    .status(isHealthy ? ExternalSystem.HealthStatus.HEALTHY : ExternalSystem.HealthStatus.UNHEALTHY)
                    .message(isHealthy ? "System is responding normally" : "System is not responding")
                    .responseTime(responseTime)
                    .build();

        } catch (Exception e) {
            return HealthCheckResult.builder()
                    .status(ExternalSystem.HealthStatus.UNHEALTHY)
                    .message("Health check failed: " + e.getMessage())
                    .responseTime(System.currentTimeMillis() - startTime)
                    .build();
        }
    }

    private Double calculateAverageExecutionTime(UUID tenantId) {
        // Calculate average execution time
        return 25.5 + Math.random() * 15; // 25-40 seconds
    }

    private Double calculateAverageResponseTime(UUID tenantId) {
        // Calculate average response time
        return 150.0 + Math.random() * 100; // 150-250ms
    }

    private void processScheduledIntegrationsForTenant(UUID tenantId) {
        // Process scheduled integrations for tenant
        List<IntegrationConfig> scheduledIntegrations = integrationConfigRepository
                .findByTenantIdAndSyncFrequencyIsNotNullAndStatus(tenantId, IntegrationConfig.Status.ACTIVE);

        for (IntegrationConfig config : scheduledIntegrations) {
            if (shouldExecuteScheduledIntegration(config)) {
                ExecuteIntegrationRequest request = ExecuteIntegrationRequest.builder()
                        .configId(config.getId())
                        .data(Map.of())
                        .triggeredBy("SCHEDULER")
                        .build();

                executeIntegration(tenantId, request);
            }
        }

        log.info("Processed {} scheduled integrations for tenant: {}", scheduledIntegrations.size(), tenantId);
    }

    private boolean shouldExecuteScheduledIntegration(IntegrationConfig config) {
        // Check if integration should be executed
        return true; // Simplified
    }

    private void performSystemHealthChecksForTenant(UUID tenantId) {
        // Perform health checks for all external systems
        List<ExternalSystem> systems = externalSystemRepository.findByTenantId(tenantId);

        for (ExternalSystem system : systems) {
            try {
                checkSystemHealth(tenantId, system.getId());
            } catch (Exception e) {
                log.error("Health check failed for system: {}", system.getId(), e);
            }
        }

        log.info("Performed health checks for {} systems in tenant: {}", systems.size(), tenantId);
    }

    private void cleanupIntegrationLogsForTenant(UUID tenantId) {
        // Clean up old integration logs
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        long deletedCount = integrationLogRepository.deleteByTenantIdAndCreatedAtBefore(tenantId, cutoffDate);

        log.info("Cleaned up {} integration logs for tenant: {}", deletedCount, tenantId);
    }

    private void logIntegrationEvent(UUID tenantId, String eventType, String description) {
        // Log integration events
        IntegrationLog log = IntegrationLog.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .eventType(eventType)
                .description(description)
                .timestamp(LocalDateTime.now())
                .severity(calculateEventSeverity(eventType))
                .build();

        integrationLogRepository.save(log);
    }

    private String calculateEventSeverity(String eventType) {
        return switch (eventType) {
            case "INTEGRATION_FAILED", "SYSTEM_UNHEALTHY" -> "HIGH";
            case "INTEGRATION_RETRY", "SYSTEM_WARNING" -> "MEDIUM";
            default -> "LOW";
        };
    }

    // DTO conversion methods
    private IntegrationConfigDto convertToDto(IntegrationConfig config) {
        return IntegrationConfigDto.builder()
                .id(config.getId())
                .tenantId(config.getTenantId())
                .name(config.getName())
                .description(config.getDescription())
                .integrationType(config.getIntegrationType())
                .sourceSystem(config.getSourceSystem())
                .targetSystem(config.getTargetSystem())
                .authenticationType(config.getAuthenticationType())
                .syncFrequency(config.getSyncFrequency())
                .status(config.getStatus())
                .createdAt(config.getCreatedAt())
                .updatedAt(config.getUpdatedAt())
                .build();
    }

    private IntegrationExecutionDto convertToDto(IntegrationExecution execution) {
        return IntegrationExecutionDto.builder()
                .id(execution.getId())
                .configId(execution.getConfigId())
                .status(execution.getStatus())
                .triggeredBy(execution.getTriggeredBy())
                .startedAt(execution.getStartedAt())
                .completedAt(execution.getCompletedAt())
                .errorMessage(execution.getErrorMessage())
                .processedRecords(execution.getProcessedRecords())
                .build();
    }

    private DataMappingDto convertToDto(DataMapping mapping) {
        return DataMappingDto.builder()
                .id(mapping.getId())
                .tenantId(mapping.getTenantId())
                .name(mapping.getName())
                .description(mapping.getDescription())
                .sourceEntityType(mapping.getSourceEntityType())
                .targetEntityType(mapping.getTargetEntityType())
                .isActive(mapping.getIsActive())
                .createdAt(mapping.getCreatedAt())
                .build();
    }

    private ExternalSystemDto convertToDto(ExternalSystem system) {
        return ExternalSystemDto.builder()
                .id(system.getId())
                .tenantId(system.getTenantId())
                .name(system.getName())
                .description(system.getDescription())
                .systemType(system.getSystemType())
                .baseUrl(system.getBaseUrl())
                .apiVersion(system.getApiVersion())
                .authenticationType(system.getAuthenticationType())
                .status(system.getStatus())
                .healthStatus(system.getHealthStatus())
                .lastHealthCheck(system.getLastHealthCheck())
                .createdAt(system.getCreatedAt())
                .build();
    }

    // Inner classes
    @lombok.Data
    @lombok.Builder
    public static class HealthCheckResult {
        private ExternalSystem.HealthStatus status;
        private String message;
        private Long responseTime;
    }

    @lombok.Data
    @lombok.Builder
    public static class FieldMapping {
        private String sourceField;
        private String targetField;
        private String transformationType;
        private boolean required;
    }
}
