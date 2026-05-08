package com.everx.integration;

import com.everx.integration.dto.*;
import com.everx.integration.entity.IntegrationConfig;
import com.everx.integration.entity.IntegrationExecution;
import com.everx.integration.entity.IntegrationLog;
import com.everx.integration.repository.IntegrationConfigRepository;
import com.everx.integration.repository.IntegrationExecutionRepository;
import com.everx.integration.repository.IntegrationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class IntegrationService {

    private final IntegrationConfigRepository integrationRepository;
    private final IntegrationExecutionRepository executionRepository;
    private final IntegrationLogRepository logRepository;

    // Basic CRUD Operations
    public Page<IntegrationResponse> findAll(Pageable pageable) {
        return integrationRepository.findAll(pageable).map(this::toResponse);
    }

    public IntegrationResponse findById(UUID id) {
        IntegrationConfig integration = integrationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Integration not found"));
        return toResponse(integration);
    }

    @Transactional
    public IntegrationResponse create(CreateIntegrationConfigRequest request) {
        IntegrationConfig config = IntegrationConfig.builder()
            .id(UUID.randomUUID())
            .tenantId(request.getTenantId())
            .integrationName(request.getIntegrationName())
            .integrationType(request.getIntegrationType())
            .endpointUrl(request.getEndpointUrl())
            .authenticationType(request.getAuthenticationType())
            .credentials(request.getCredentials())
            .headers(request.getHeaders())
            .isActive(true)
            .status("ACTIVE")
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        
        return toResponse(integrationRepository.save(config));
    }

    @Transactional
    public IntegrationResponse update(UUID id, IntegrationConfig request) {
        IntegrationConfig existing = integrationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Integration not found"));
        
        existing.setIntegrationName(request.getIntegrationName());
        existing.setEndpointUrl(request.getEndpointUrl());
        existing.setAuthenticationType(request.getAuthenticationType());
        existing.setCredentials(request.getCredentials());
        existing.setHeaders(request.getHeaders());
        existing.setUpdatedAt(LocalDateTime.now());
        
        return toResponse(integrationRepository.save(existing));
    }

    @Transactional
    public void delete(UUID id) {
        integrationRepository.deleteById(id);
    }

    // Integration Execution
    @Transactional
    public IntegrationExecutionDto executeIntegration(ExecuteIntegrationRequest request) {
        log.info("Executing integration: {} with type: {}", request.getIntegrationId(), request.getExecutionType());
        
        IntegrationConfig config = integrationRepository.findById(request.getIntegrationId())
            .orElseThrow(() -> new RuntimeException("Integration not found"));
        
        IntegrationExecution execution = IntegrationExecution.builder()
            .id(UUID.randomUUID())
            .integrationId(request.getIntegrationId())
            .executionType(request.getExecutionType())
            .status("RUNNING")
            .startTime(LocalDateTime.now())
            .requestData(request.getRequestData())
            .build();
        
        execution = executionRepository.save(execution);
        
        try {
            // Mock execution logic
            String result = performIntegrationExecution(config, request);
            execution.setStatus("COMPLETED");
            execution.setResultData(result);
            execution.setEndTime(LocalDateTime.now());
            execution.setSuccess(true);
        } catch (Exception e) {
            execution.setStatus("FAILED");
            execution.setErrorMessage(e.getMessage());
            execution.setEndTime(LocalDateTime.now());
            execution.setSuccess(false);
            log.error("Integration execution failed", e);
        }
        
        execution = executionRepository.save(execution);
        
        // Log the execution
        logIntegrationExecution(execution);
        
        return toExecutionDto(execution);
    }

    // Integration Monitoring
    public List<IntegrationExecutionDto> getExecutionHistory(UUID integrationId, Pageable pageable) {
        return executionRepository.findByIntegrationIdOrderByStartTimeDesc(integrationId, pageable)
            .stream()
            .map(this::toExecutionDto)
            .collect(Collectors.toList());
    }

    public Map<String, Object> getIntegrationMetrics(UUID integrationId) {
        List<IntegrationExecution> executions = executionRepository.findByIntegrationId(integrationId);
        
        long totalExecutions = executions.size();
        long successfulExecutions = executions.stream().mapToLong(e -> e.getSuccess() ? 1 : 0).sum();
        double successRate = totalExecutions > 0 ? (double) successfulExecutions / totalExecutions * 100 : 0;
        
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalExecutions", totalExecutions);
        metrics.put("successfulExecutions", successfulExecutions);
        metrics.put("successRate", successRate);
        metrics.put("lastExecution", executions.stream()
            .map(IntegrationExecution::getStartTime)
            .max(LocalDateTime::compareTo)
            .orElse(null));
        metrics.put("averageExecutionTime", calculateAverageExecutionTime(executions));
        
        return metrics;
    }

    // Integration Health Check
    public Map<String, Object> performHealthCheck(UUID integrationId) {
        IntegrationConfig config = integrationRepository.findById(integrationId)
            .orElseThrow(() -> new RuntimeException("Integration not found"));
        
        Map<String, Object> healthCheck = new HashMap<>();
        
        try {
            // Mock health check logic
            boolean isHealthy = checkIntegrationHealth(config);
            healthCheck.put("status", isHealthy ? "HEALTHY" : "UNHEALTHY");
            healthCheck.put("lastChecked", LocalDateTime.now());
            healthCheck.put("responseTime", Math.random() * 1000); // Mock response time
            healthCheck.put("endpoint", config.getEndpointUrl());
        } catch (Exception e) {
            healthCheck.put("status", "ERROR");
            healthCheck.put("error", e.getMessage());
            healthCheck.put("lastChecked", LocalDateTime.now());
        }
        
        return healthCheck;
    }

    // Integration Analytics
    public IntegrationAnalyticsDto getIntegrationAnalytics(UUID tenantId) {
        List<IntegrationConfig> integrations = integrationRepository.findByTenantId(tenantId);
        List<IntegrationExecution> executions = executionRepository.findByIntegrationIdIn(
            integrations.stream().map(IntegrationConfig::getId).collect(Collectors.toList())
        );
        
        return IntegrationAnalyticsDto.builder()
            .totalIntegrations(integrations.size())
            .activeIntegrations((int) integrations.stream().filter(IntegrationConfig::getIsActive).count())
            .totalExecutions(executions.size())
            .successfulExecutions((int) executions.stream().filter(IntegrationExecution::getSuccess).count())
            .successRate(calculateSuccessRate(executions))
            .averageExecutionTime(calculateAverageExecutionTime(executions))
            .mostUsedIntegration(getMostUsedIntegration(integrations, executions))
            .generatedAt(LocalDateTime.now())
            .build();
    }

    // Helper Methods
    private String performIntegrationExecution(IntegrationConfig config, ExecuteIntegrationRequest request) {
        // Mock integration execution based on type
        return switch (config.getIntegrationType()) {
            case "REST_API" -> executeRestApiCall(config, request);
            case "SOAP_API" -> executeSoapCall(config, request);
            case "DATABASE" -> executeDatabaseIntegration(config, request);
            case "FILE_TRANSFER" -> executeFileTransfer(config, request);
            case "WEBHOOK" -> executeWebhook(config, request);
            default -> "Default integration execution result";
        };
    }

    private String executeRestApiCall(IntegrationConfig config, ExecuteIntegrationRequest request) {
        log.info("Executing REST API call to: {}", config.getEndpointUrl());
        return "REST API call executed successfully";
    }

    private String executeSoapCall(IntegrationConfig config, ExecuteIntegrationRequest request) {
        log.info("Executing SOAP call to: {}", config.getEndpointUrl());
        return "SOAP call executed successfully";
    }

    private String executeDatabaseIntegration(IntegrationConfig config, ExecuteIntegrationRequest request) {
        log.info("Executing database integration");
        return "Database integration executed successfully";
    }

    private String executeFileTransfer(IntegrationConfig config, ExecuteIntegrationRequest request) {
        log.info("Executing file transfer");
        return "File transfer executed successfully";
    }

    private String executeWebhook(IntegrationConfig config, ExecuteIntegrationRequest request) {
        log.info("Executing webhook to: {}", config.getEndpointUrl());
        return "Webhook executed successfully";
    }

    private boolean checkIntegrationHealth(IntegrationConfig config) {
        // Mock health check implementation
        return Math.random() > 0.1; // 90% chance of being healthy
    }

    private void logIntegrationExecution(IntegrationExecution execution) {
        IntegrationLog log = IntegrationLog.builder()
            .id(UUID.randomUUID())
            .integrationId(execution.getIntegrationId())
            .executionId(execution.getId())
            .status(execution.getStatus())
            .message("Integration execution " + execution.getStatus().toLowerCase())
            .timestamp(LocalDateTime.now())
            .build();
        
        logRepository.save(log);
    }

    private double calculateSuccessRate(List<IntegrationExecution> executions) {
        if (executions.isEmpty()) return 0.0;
        long successful = executions.stream().mapToLong(e -> e.getSuccess() ? 1 : 0).sum();
        return (double) successful / executions.size() * 100;
    }

    private double calculateAverageExecutionTime(List<IntegrationExecution> executions) {
        return executions.stream()
            .filter(e -> e.getStartTime() != null && e.getEndTime() != null)
            .mapToLong(e -> java.time.Duration.between(e.getStartTime(), e.getEndTime()).toMillis())
            .average()
            .orElse(0.0);
    }

    private String getMostUsedIntegration(List<IntegrationConfig> integrations, List<IntegrationExecution> executions) {
        Map<UUID, Long> usageCount = executions.stream()
            .collect(Collectors.groupingBy(IntegrationExecution::getIntegrationId, Collectors.counting()));
        
        return usageCount.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(entry -> integrations.stream()
                .filter(i -> i.getId().equals(entry.getKey()))
                .findFirst()
                .map(IntegrationConfig::getIntegrationName)
                .orElse("Unknown"))
            .orElse("None");
    }

    private IntegrationResponse toResponse(IntegrationConfig i) {
        return IntegrationResponse.builder()
            .id(i.getId())
            .integrationName(i.getIntegrationName())
            .integrationType(i.getIntegrationType())
            .status(i.getStatus())
            .isActive(i.getIsActive())
            .endpointUrl(i.getEndpointUrl())
            .createdAt(i.getCreatedAt())
            .updatedAt(i.getUpdatedAt())
            .build();
    }

    private IntegrationExecutionDto toExecutionDto(IntegrationExecution e) {
        return IntegrationExecutionDto.builder()
            .id(e.getId())
            .integrationId(e.getIntegrationId())
            .executionType(e.getExecutionType())
            .status(e.getStatus())
            .startTime(e.getStartTime())
            .endTime(e.getEndTime())
            .success(e.getSuccess())
            .errorMessage(e.getErrorMessage())
            .requestData(e.getRequestData())
            .resultData(e.getResultData())
            .build();
    }
}
