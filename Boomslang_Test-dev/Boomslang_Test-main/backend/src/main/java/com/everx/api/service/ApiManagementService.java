package com.everx.api.service;

import com.everx.api.dto.*;
import com.everx.api.entity.ApiKey;
import com.everx.api.entity.ApiUsage;
import com.everx.api.repository.ApiKeyRepository;
import com.everx.api.repository.ApiUsageRepository;
import com.everx.tenant.service.TenantContextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApiManagementService {

    private final ApiKeyRepository apiKeyRepository;
    private final ApiUsageRepository apiUsageRepository;
    private final TenantContextService tenantContextService;

    @Transactional
    public ApiKeyDto createApiKey(CreateApiKeyRequest request) {
        log.info("Creating API key for tenant: {}", request.getTenantId());

        String keyValue = generateApiKey();
        
        ApiKey apiKey = ApiKey.builder()
                .keyValue(keyValue)
                .name(request.getName())
                .description(request.getDescription())
                .tenantId(request.getTenantId())
                .createdByUserId(request.getCreatedByUserId())
                .isActive(true)
                .expiresAt(request.getExpiresAt())
                .rateLimitPerMinute(request.getRateLimitPerMinute() != null ? request.getRateLimitPerMinute() : 100)
                .rateLimitPerHour(request.getRateLimitPerHour() != null ? request.getRateLimitPerHour() : 1000)
                .rateLimitPerDay(request.getRateLimitPerDay() != null ? request.getRateLimitPerDay() : 10000)
                .allowedIps(request.getAllowedIps())
                .allowedOrigins(request.getAllowedOrigins())
                .permissions(request.getPermissions())
                .apiVersion(request.getApiVersion() != null ? request.getApiVersion() : "v1")
                .keyType(request.getKeyType() != null ? request.getKeyType() : ApiKey.KeyType.STANDARD)
                .isReadonly(request.getIsReadonly() != null ? request.getIsReadonly() : false)
                .build();

        apiKey = apiKeyRepository.save(apiKey);
        return convertToDto(apiKey);
    }

    @Transactional
    public ApiKeyDto updateApiKey(UUID apiKeyId, UpdateApiKeyRequest request) {
        log.info("Updating API key: {}", apiKeyId);

        ApiKey apiKey = apiKeyRepository.findById(apiKeyId)
                .orElseThrow(() -> new RuntimeException("API key not found"));

        if (request.getName() != null) {
            apiKey.setName(request.getName());
        }
        if (request.getDescription() != null) {
            apiKey.setDescription(request.getDescription());
        }
        if (request.getExpiresAt() != null) {
            apiKey.setExpiresAt(request.getExpiresAt());
        }
        if (request.getRateLimitPerMinute() != null) {
            apiKey.setRateLimitPerMinute(request.getRateLimitPerMinute());
        }
        if (request.getRateLimitPerHour() != null) {
            apiKey.setRateLimitPerHour(request.getRateLimitPerHour());
        }
        if (request.getRateLimitPerDay() != null) {
            apiKey.setRateLimitPerDay(request.getRateLimitPerDay());
        }
        if (request.getAllowedIps() != null) {
            apiKey.setAllowedIps(request.getAllowedIps());
        }
        if (request.getAllowedOrigins() != null) {
            apiKey.setAllowedOrigins(request.getAllowedOrigins());
        }
        if (request.getPermissions() != null) {
            apiKey.setPermissions(request.getPermissions());
        }
        if (request.getIsActive() != null) {
            apiKey.setIsActive(request.getIsActive());
        }

        apiKey = apiKeyRepository.save(apiKey);
        return convertToDto(apiKey);
    }

    @Transactional
    public void revokeApiKey(UUID apiKeyId, String reason) {
        log.info("Revoking API key: {} with reason: {}", apiKeyId, reason);

        ApiKey apiKey = apiKeyRepository.findById(apiKeyId)
                .orElseThrow(() -> new RuntimeException("API key not found"));

        apiKey.revoke(reason);
        apiKeyRepository.save(apiKey);
    }

    @Transactional
    public void deleteApiKey(UUID apiKeyId) {
        log.info("Deleting API key: {}", apiKeyId);

        ApiKey apiKey = apiKeyRepository.findById(apiKeyId)
                .orElseThrow(() -> new RuntimeException("API key not found"));

        apiKeyRepository.delete(apiKey);
    }

    @Transactional(readOnly = true)
    public ApiKeyDto getApiKeyById(UUID apiKeyId) {
        ApiKey apiKey = apiKeyRepository.findById(apiKeyId)
                .orElseThrow(() -> new RuntimeException("API key not found"));
        return convertToDto(apiKey);
    }

    @Transactional(readOnly = true)
    public ApiKeyDto getApiKeyByKeyValue(String keyValue) {
        ApiKey apiKey = apiKeyRepository.findByKeyValue(keyValue)
                .orElseThrow(() -> new RuntimeException("API key not found"));
        return convertToDto(apiKey);
    }

    @Transactional(readOnly = true)
    public List<ApiKeyDto> getApiKeysByTenant(UUID tenantId) {
        return apiKeyRepository.findByTenantIdOrderByCreatedAtDesc(tenantId)
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<ApiKeyDto> getAllApiKeys(Pageable pageable) {
        return apiKeyRepository.findAll(pageable)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public Page<ApiKeyDto> searchApiKeys(String search, Pageable pageable) {
        return apiKeyRepository.searchApiKeys(search, pageable)
                .map(this::convertToDto);
    }

    @Transactional
    public void recordApiUsage(ApiUsageRecordRequest request) {
        ApiUsage usage = ApiUsage.builder()
                .apiKeyId(request.getApiKeyId())
                .tenantId(request.getTenantId())
                .endpoint(request.getEndpoint())
                .method(request.getMethod())
                .statusCode(request.getStatusCode())
                .responseTimeMs(request.getResponseTimeMs())
                .requestSizeBytes(request.getRequestSizeBytes())
                .responseSizeBytes(request.getResponseSizeBytes())
                .ipAddress(request.getIpAddress())
                .userAgent(request.getUserAgent())
                .requestId(request.getRequestId())
                .errorMessage(request.getErrorMessage())
                .timestamp(LocalDateTime.now())
                .apiVersion(request.getApiVersion())
                .isSuccess(request.getStatusCode() != null && request.getStatusCode() < 400)
                .build();

        apiUsageRepository.save(usage);

        // Update API key usage count
        if (request.getApiKeyId() != null) {
            apiKeyRepository.findById(request.getApiKeyId()).ifPresent(apiKey -> {
                apiKey.recordUsage();
                apiKeyRepository.save(apiKey);
            });
        }
    }

    @Transactional(readOnly = true)
    public Page<ApiUsageDto> getApiUsage(UUID tenantId, Pageable pageable) {
        return apiUsageRepository.findByTenantIdOrderByTimestampDesc(tenantId, pageable)
                .map(this::convertUsageToDto);
    }

    @Transactional(readOnly = true)
    public Page<ApiUsageDto> getApiUsageByKey(UUID apiKeyId, Pageable pageable) {
        return apiUsageRepository.findByApiKeyIdOrderByTimestampDesc(apiKeyId, pageable)
                .map(this::convertUsageToDto);
    }

    @Transactional(readOnly = true)
    public ApiUsageStatsDto getApiUsageStats(UUID tenantId, LocalDateTime startDate, LocalDateTime endDate) {
        Long totalRequests = apiUsageRepository.countByTenantIdAndTimestampBetween(tenantId, startDate, endDate);
        Long successRequests = apiUsageRepository.countByTenantIdAndTimestampBetweenAndIsSuccessTrue(tenantId, startDate, endDate);
        Long errorRequests = totalRequests - successRequests;
        Double avgResponseTime = apiUsageRepository.getAverageResponseTimeByTenantIdAndTimestampBetween(tenantId, startDate, endDate);

        return ApiUsageStatsDto.builder()
                .totalRequests(totalRequests)
                .successRequests(successRequests)
                .errorRequests(errorRequests)
                .successRate(totalRequests > 0 ? (double) successRequests / totalRequests * 100 : 0.0)
                .averageResponseTime(avgResponseTime != null ? avgResponseTime : 0.0)
                .build();
    }

    @Transactional
    public void cleanupExpiredApiKeys() {
        log.info("Cleaning up expired API keys");
        
        List<ApiKey> expiredKeys = apiKeyRepository.findExpiredKeys();
        for (ApiKey key : expiredKeys) {
            key.setIsActive(false);
            apiKeyRepository.save(key);
        }
        
        log.info("Deactivated {} expired API keys", expiredKeys.size());
    }

    @Transactional
    public void cleanupOldApiUsage() {
        log.info("Cleaning up old API usage records");
        
        // Delete usage records older than 90 days
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(90);
        int deletedCount = apiUsageRepository.deleteByTimestampBefore(cutoffDate);
        
        log.info("Deleted {} old API usage records", deletedCount);
    }

    private String generateApiKey() {
        return "evx_" + UUID.randomUUID().toString().replace("-", "");
    }

    private ApiKeyDto convertToDto(ApiKey apiKey) {
        return ApiKeyDto.builder()
                .id(apiKey.getId())
                .keyValue(apiKey.getMaskedKey())
                .name(apiKey.getName())
                .description(apiKey.getDescription())
                .tenantId(apiKey.getTenantId())
                .createdByUserId(apiKey.getCreatedByUserId())
                .isActive(apiKey.getIsActive())
                .expiresAt(apiKey.getExpiresAt())
                .lastUsedAt(apiKey.getLastUsedAt())
                .usageCount(apiKey.getUsageCount())
                .rateLimitPerMinute(apiKey.getRateLimitPerMinute())
                .rateLimitPerHour(apiKey.getRateLimitPerHour())
                .rateLimitPerDay(apiKey.getRateLimitPerDay())
                .allowedIps(apiKey.getAllowedIps())
                .allowedOrigins(apiKey.getAllowedOrigins())
                .permissions(apiKey.getPermissions())
                .apiVersion(apiKey.getApiVersion())
                .keyType(apiKey.getKeyType())
                .isReadonly(apiKey.getIsReadonly())
                .revokedAt(apiKey.getRevokedAt())
                .revocationReason(apiKey.getRevocationReason())
                .createdAt(apiKey.getCreatedAt())
                .updatedAt(apiKey.getUpdatedAt())
                .build();
    }

    private ApiUsageDto convertUsageToDto(ApiUsage usage) {
        return ApiUsageDto.builder()
                .id(usage.getId())
                .apiKeyId(usage.getApiKeyId())
                .tenantId(usage.getTenantId())
                .endpoint(usage.getEndpoint())
                .method(usage.getMethod())
                .statusCode(usage.getStatusCode())
                .responseTimeMs(usage.getResponseTimeMs())
                .requestSizeBytes(usage.getRequestSizeBytes())
                .responseSizeBytes(usage.getResponseSizeBytes())
                .ipAddress(usage.getIpAddress())
                .userAgent(usage.getUserAgent())
                .requestId(usage.getRequestId())
                .errorMessage(usage.getErrorMessage())
                .timestamp(usage.getTimestamp())
                .apiVersion(usage.getApiVersion())
                .isSuccess(usage.getIsSuccess())
                .build();
    }
}
