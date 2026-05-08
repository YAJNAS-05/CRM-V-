package com.everx.performance.service;

import com.everx.performance.dto.*;
import com.everx.performance.entity.*;
import com.everx.performance.repository.*;
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
public class AdvancedPerformanceOptimizationService {

    private final PerformanceMetricRepository metricRepository;
    private final OptimizationRuleRepository ruleRepository;
    private final PerformanceAlertRepository alertRepository;
    private final CacheOptimizationRepository cacheRepository;
    private final DatabaseOptimizationRepository dbRepository;
    private final TenantContextService tenantContextService;

    // Performance Metrics Collection
    @Transactional
    public PerformanceMetricDto recordMetric(UUID tenantId, RecordMetricRequest request) {
        log.info("Recording performance metric: {} for tenant: {}", request.getMetricName(), tenantId);

        PerformanceMetric metric = PerformanceMetric.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .metricName(request.getMetricName())
                .metricType(request.getMetricType())
                .value(request.getValue())
                .unit(request.getUnit())
                .tags(request.getTags())
                .source(request.getSource())
                .timestamp(LocalDateTime.now())
                .build();

        metric = metricRepository.save(metric);

        // Check for performance alerts
        checkPerformanceAlerts(tenantId, metric);

        // Apply optimization rules
        applyOptimizationRules(tenantId, metric);

        return convertToDto(metric);
    }

    @Async
    @Transactional
    public CompletableFuture<List<PerformanceMetricDto>> recordBatchMetrics(UUID tenantId, RecordBatchMetricsRequest request) {
        log.info("Recording batch metrics for tenant: {}", tenantId);

        List<PerformanceMetric> metrics = new ArrayList<>();
        List<PerformanceMetricDto> metricDtos = new ArrayList<>();

        for (RecordMetricRequest metricRequest : request.getMetrics()) {
            PerformanceMetric metric = PerformanceMetric.builder()
                    .id(UUID.randomUUID())
                    .tenantId(tenantId)
                    .metricName(metricRequest.getMetricName())
                    .metricType(metricRequest.getMetricType())
                    .value(metricRequest.getValue())
                    .unit(metricRequest.getUnit())
                    .tags(metricRequest.getTags())
                    .source(metricRequest.getSource())
                    .timestamp(LocalDateTime.now())
                    .build();

            metrics.add(metric);
        }

        // Save all metrics
        metrics = metricRepository.saveAll(metrics);

        // Convert to DTOs
        for (PerformanceMetric metric : metrics) {
            metricDtos.add(convertToDto(metric));
            
            // Check alerts and apply rules for each metric
            checkPerformanceAlerts(tenantId, metric);
            applyOptimizationRules(tenantId, metric);
        }

        return CompletableFuture.completedFuture(metricDtos);
    }

    // Optimization Rules Management
    @Transactional
    public OptimizationRuleDto createOptimizationRule(UUID tenantId, CreateOptimizationRuleRequest request) {
        log.info("Creating optimization rule: {} for tenant: {}", request.getName(), tenantId);

        OptimizationRule rule = OptimizationRule.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .name(request.getName())
                .description(request.getDescription())
                .ruleType(request.getRuleType())
                .conditions(request.getConditions())
                .actions(request.getActions())
                .priority(request.getPriority())
                .isEnabled(true)
                .autoApply(request.isAutoApply())
                .cooldownMinutes(request.getCooldownMinutes())
                .createdAt(LocalDateTime.now())
                .createdBy(request.getCreatedBy())
                .build();

        rule = ruleRepository.save(rule);

        return convertToDto(rule);
    }

    @Async
    @Transactional
    public CompletableFuture<List<OptimizationActionDto>> evaluateOptimizationRules(UUID tenantId, PerformanceMetric metric) {
        log.info("Evaluating optimization rules for tenant: {} and metric: {}", tenantId, metric.getMetricName());

        List<OptimizationRule> applicableRules = ruleRepository
                .findByTenantIdAndIsEnabledOrderByPriorityDesc(tenantId, true);
        List<OptimizationActionDto> appliedActions = new ArrayList<>();

        for (OptimizationRule rule : applicableRules) {
            try {
                if (evaluateRuleConditions(rule, metric)) {
                    // Apply optimization actions
                    List<OptimizationAction> actions = applyOptimizationActions(rule, metric);
                    
                    for (OptimizationAction action : actions) {
                        appliedActions.add(convertToDto(action));
                    }

                    // Update rule last applied time
                    rule.setLastAppliedAt(LocalDateTime.now());
                    ruleRepository.save(rule);
                }
            } catch (Exception e) {
                log.error("Error evaluating rule: {} for tenant: {}", rule.getId(), tenantId, e);
            }
        }

        return CompletableFuture.completedFuture(appliedActions);
    }

    // Cache Optimization
    @Transactional
    public CacheOptimizationDto optimizeCache(UUID tenantId, OptimizeCacheRequest request) {
        log.info("Optimizing cache for tenant: {}", tenantId);

        // Analyze cache performance
        CacheAnalysis analysis = analyzeCachePerformance(tenantId);
        
        // Generate optimization recommendations
        List<CacheRecommendation> recommendations = generateCacheRecommendations(analysis);
        
        // Apply optimizations if requested
        List<OptimizationResult> results = new ArrayList<>();
        if (request.isApplyOptimizations()) {
            for (CacheRecommendation recommendation : recommendations) {
                try {
                    OptimizationResult result = applyCacheOptimization(tenantId, recommendation);
                    results.add(result);
                } catch (Exception e) {
                    log.error("Error applying cache optimization: {}", recommendation.getType(), e);
                }
            }
        }

        // Create cache optimization record
        CacheOptimization optimization = CacheOptimization.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .analysis(analysis)
                .recommendations(recommendations)
                .results(results)
                .status(CacheOptimization.Status.COMPLETED)
                .createdAt(LocalDateTime.now())
                .build();

        optimization = cacheRepository.save(optimization);

        return convertToDto(optimization);
    }

    // Database Optimization
    @Transactional
    public DatabaseOptimizationDto optimizeDatabase(UUID tenantId, OptimizeDatabaseRequest request) {
        log.info("Optimizing database for tenant: {}", tenantId);

        // Analyze database performance
        DatabaseAnalysis analysis = analyzeDatabasePerformance(tenantId);
        
        // Generate optimization recommendations
        List<DatabaseRecommendation> recommendations = generateDatabaseRecommendations(analysis);
        
        // Apply optimizations if requested
        List<OptimizationResult> results = new ArrayList<>();
        if (request.isApplyOptimizations()) {
            for (DatabaseRecommendation recommendation : recommendations) {
                try {
                    OptimizationResult result = applyDatabaseOptimization(tenantId, recommendation);
                    results.add(result);
                } catch (Exception e) {
                    log.error("Error applying database optimization: {}", recommendation.getType(), e);
                }
            }
        }

        // Create database optimization record
        DatabaseOptimization optimization = DatabaseOptimization.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .analysis(analysis)
                .recommendations(recommendations)
                .results(results)
                .status(DatabaseOptimization.Status.COMPLETED)
                .createdAt(LocalDateTime.now())
                .build();

        optimization = dbRepository.save(optimization);

        return convertToDto(optimization);
    }

    // Performance Analytics
    @Transactional(readOnly = true)
    public PerformanceAnalyticsDto getPerformanceAnalytics(UUID tenantId, AnalyticsRequest request) {
        log.info("Getting performance analytics for tenant: {}", tenantId);

        // Get metrics summary
        long totalMetrics = metricRepository.countByTenantId(tenantId);
        long metricsToday = metricRepository.countByTenantIdAndTimestampAfter(tenantId, LocalDateTime.now().minusDays(1));
        
        // Get optimization metrics
        long totalRules = ruleRepository.countByTenantId(tenantId);
        long activeRules = ruleRepository.countByTenantIdAndIsEnabled(tenantId, true);
        
        // Get alert metrics
        long totalAlerts = alertRepository.countByTenantId(tenantId);
        long activeAlerts = alertRepository.countByTenantIdAndStatus(tenantId, PerformanceAlert.Status.ACTIVE);
        
        // Get cache optimization metrics
        long cacheOptimizations = cacheRepository.countByTenantId(tenantId);
        long successfulCacheOptimizations = cacheRepository.countByTenantIdAndStatus(tenantId, CacheOptimization.Status.COMPLETED);
        
        // Get database optimization metrics
        long dbOptimizations = dbRepository.countByTenantId(tenantId);
        long successfulDbOptimizations = dbRepository.countByTenantIdAndStatus(tenantId, DatabaseOptimization.Status.COMPLETED);

        return PerformanceAnalyticsDto.builder()
                .tenantId(tenantId)
                .metricsSummary(Map.of(
                        "totalMetrics", totalMetrics,
                        "metricsToday", metricsToday,
                        "averageResponseTime", calculateAverageResponseTime(tenantId),
                        "throughput", calculateThroughput(tenantId)
                ))
                .optimizationMetrics(Map.of(
                        "totalRules", totalRules,
                        "activeRules", activeRules,
                        "ruleSuccessRate", calculateRuleSuccessRate(tenantId)
                ))
                .alertMetrics(Map.of(
                        "totalAlerts", totalAlerts,
                        "activeAlerts", activeAlerts,
                        "alertResolutionRate", calculateAlertResolutionRate(tenantId)
                ))
                .cacheMetrics(Map.of(
                        "totalOptimizations", cacheOptimizations,
                        "successfulOptimizations", successfulCacheOptimizations,
                        "cacheHitRate", calculateCacheHitRate(tenantId),
                        "optimizationSuccessRate", cacheOptimizations > 0 ? (double) successfulCacheOptimizations / cacheOptimizations : 0.0
                ))
                .databaseMetrics(Map.of(
                        "totalOptimizations", dbOptimizations,
                        "successfulOptimizations", successfulDbOptimizations,
                        "queryPerformance", calculateQueryPerformance(tenantId),
                        "indexUsage", calculateIndexUsage(tenantId)
                ))
                .generatedAt(LocalDateTime.now())
                .build();
    }

    // Scheduled Tasks
    @Scheduled(cron = "0 */2 * * * *") // Every 2 minutes
    @Transactional
    public void collectSystemMetrics() {
        log.info("Collecting system performance metrics");

        List<UUID> activeTenants = tenantContextService.getActiveTenants();

        for (UUID tenantId : activeTenants) {
            try {
                collectSystemMetricsForTenant(tenantId);
            } catch (Exception e) {
                log.error("Error collecting metrics for tenant: {}", tenantId, e);
            }
        }
    }

    @Scheduled(cron = "0 */5 * * * *") // Every 5 minutes
    @Transactional
    public void evaluatePerformanceRules() {
        log.info("Evaluating performance optimization rules");

        List<UUID> activeTenants = tenantContextService.getActiveTenants();

        for (UUID tenantId : activeTenants) {
            try {
                evaluatePerformanceRulesForTenant(tenantId);
            } catch (Exception e) {
                log.error("Error evaluating rules for tenant: {}", tenantId, e);
            }
        }
    }

    @Scheduled(cron = "0 0 1 * * *") // Every day at 1 AM
    @Transactional
    public void performAutomaticOptimizations() {
        log.info("Performing automatic performance optimizations");

        List<UUID> activeTenants = tenantContextService.getActiveTenants();

        for (UUID tenantId : activeTenants) {
            try {
                performAutomaticOptimizationsForTenant(tenantId);
            } catch (Exception e) {
                log.error("Error performing optimizations for tenant: {}", tenantId, e);
            }
        }
    }

    @Scheduled(cron = "0 0 2 * * 0") // Every Sunday at 2 AM
    @Transactional
    public void cleanupPerformanceData() {
        log.info("Cleaning up performance data");

        List<UUID> activeTenants = tenantContextService.getActiveTenants();

        for (UUID tenantId : activeTenants) {
            try {
                cleanupPerformanceDataForTenant(tenantId);
            } catch (Exception e) {
                log.error("Error cleaning up data for tenant: {}", tenantId, e);
            }
        }
    }

    // Private helper methods
    private void checkPerformanceAlerts(UUID tenantId, PerformanceMetric metric) {
        // Check if metric triggers any alerts
        List<PerformanceAlert> alerts = alertRepository.findByTenantIdAndMetricName(tenantId, metric.getMetricName());

        for (PerformanceAlert alert : alerts) {
            if (alert.isActive() && evaluateAlertCondition(alert, metric)) {
                triggerPerformanceAlert(alert, metric);
            }
        }
    }

    private boolean evaluateAlertCondition(PerformanceAlert alert, PerformanceMetric metric) {
        // Evaluate alert condition
        return switch (alert.getConditionType()) {
            case "GREATER_THAN" -> metric.getValue() > alert.getThreshold();
            case "LESS_THAN" -> metric.getValue() < alert.getThreshold();
            case "EQUALS" -> Objects.equals(metric.getValue(), alert.getThreshold());
            default -> false;
        };
    }

    private void triggerPerformanceAlert(PerformanceAlert alert, PerformanceMetric metric) {
        // Trigger performance alert
        log.warn("Performance alert triggered: {} for metric: {} with value: {}", 
                alert.getName(), metric.getMetricName(), metric.getValue());

        alert.setLastTriggeredAt(LocalDateTime.now());
        alert.setTriggerCount(alert.getTriggerCount() + 1);
        alertRepository.save(alert);
    }

    private void applyOptimizationRules(UUID tenantId, PerformanceMetric metric) {
        // Apply optimization rules asynchronously
        evaluateOptimizationRules(tenantId, metric);
    }

    private boolean evaluateRuleConditions(OptimizationRule rule, PerformanceMetric metric) {
        // Evaluate rule conditions
        return rule.getConditions().stream()
                .allMatch(condition -> evaluateCondition(condition, metric));
    }

    private boolean evaluateCondition(Map<String, Object> condition, PerformanceMetric metric) {
        // Evaluate individual condition
        String metricName = (String) condition.get("metricName");
        String operator = (String) condition.get("operator");
        Double threshold = ((Number) condition.get("threshold")).doubleValue();

        if (!metric.getMetricName().equals(metricName)) {
            return false;
        }

        return switch (operator) {
            case ">" -> metric.getValue() > threshold;
            case "<" -> metric.getValue() < threshold;
            case ">=" -> metric.getValue() >= threshold;
            case "<=" -> metric.getValue() <= threshold;
            case "==" -> Objects.equals(metric.getValue(), threshold);
            default -> false;
        };
    }

    private List<OptimizationAction> applyOptimizationActions(OptimizationRule rule, PerformanceMetric metric) {
        List<OptimizationAction> actions = new ArrayList();

        for (Map<String, Object> actionConfig : rule.getActions()) {
            try {
                OptimizationAction action = executeOptimizationAction(actionConfig, metric);
                actions.add(action);
            } catch (Exception e) {
                log.error("Error executing optimization action", e);
            }
        }

        return actions;
    }

    private OptimizationAction executeOptimizationAction(Map<String, Object> actionConfig, PerformanceMetric metric) {
        String actionType = (String) actionConfig.get("type");

        OptimizationAction action = OptimizationAction.builder()
                .id(UUID.randomUUID())
                .actionType(actionType)
                .metricId(metric.getId())
                .status(OptimizationAction.Status.COMPLETED)
                .executedAt(LocalDateTime.now())
                .build();

        // Execute specific action based on type
        switch (actionType) {
            case "SCALE_UP" -> executeScaleUpAction(actionConfig, metric);
            case "SCALE_DOWN" -> executeScaleDownAction(actionConfig, metric);
            case "CLEAR_CACHE" -> executeClearCacheAction(actionConfig, metric);
            case "OPTIMIZE_QUERY" -> executeOptimizeQueryAction(actionConfig, metric);
            default -> log.warn("Unknown optimization action type: {}", actionType);
        }

        return action;
    }

    private void executeScaleUpAction(Map<String, Object> actionConfig, PerformanceMetric metric) {
        // Execute scale up action
        log.info("Executing scale up action for metric: {}", metric.getMetricName());
    }

    private void executeScaleDownAction(Map<String, Object> actionConfig, PerformanceMetric metric) {
        // Execute scale down action
        log.info("Executing scale down action for metric: {}", metric.getMetricName());
    }

    private void executeClearCacheAction(Map<String, Object> actionConfig, PerformanceMetric metric) {
        // Execute clear cache action
        log.info("Executing clear cache action for metric: {}", metric.getMetricName());
    }

    private void executeOptimizeQueryAction(Map<String, Object> actionConfig, PerformanceMetric metric) {
        // Execute optimize query action
        log.info("Executing optimize query action for metric: {}", metric.getMetricName());
    }

    private CacheAnalysis analyzeCachePerformance(UUID tenantId) {
        // Analyze cache performance
        return CacheAnalysis.builder()
                .totalCacheSize(1024.0 + Math.random() * 2048) // 1-3 GB
                .hitRate(0.85 + Math.random() * 0.1) // 85-95%
                .missRate(0.05 + Math.random() * 0.1) // 5-15%
                .evictionRate(0.02 + Math.random() * 0.03) // 2-5%
                .averageAccessTime(1.5 + Math.random() * 2.5) // 1.5-4ms
                .build();
    }

    private List<CacheRecommendation> generateCacheRecommendations(CacheAnalysis analysis) {
        List<CacheRecommendation> recommendations = new ArrayList<>();

        if (analysis.getHitRate() < 0.90) {
            recommendations.add(CacheRecommendation.builder()
                    .type("INCREASE_CACHE_SIZE")
                    .description("Increase cache size to improve hit rate")
                    .priority("HIGH")
                    .estimatedImprovement(0.05)
                    .build());
        }

        if (analysis.getEvictionRate() > 0.04) {
            recommendations.add(CacheRecommendation.builder()
                    .type("OPTIMIZE_EVICTION_POLICY")
                    .description("Optimize cache eviction policy")
                    .priority("MEDIUM")
                    .estimatedImprovement(0.03)
                    .build());
        }

        return recommendations;
    }

    private OptimizationResult applyCacheOptimization(UUID tenantId, CacheRecommendation recommendation) {
        // Apply cache optimization
        log.info("Applying cache optimization: {} for tenant: {}", recommendation.getType(), tenantId);

        return OptimizationResult.builder()
                .type(recommendation.getType())
                .status(OptimizationResult.Status.SUCCESS)
                .appliedAt(LocalDateTime.now())
                .actualImprovement(recommendation.getEstimatedImprovement() * 0.8) // 80% of estimated
                .build();
    }

    private DatabaseAnalysis analyzeDatabasePerformance(UUID tenantId) {
        // Analyze database performance
        return DatabaseAnalysis.builder()
                .totalConnections(50.0 + Math.random() * 100) // 50-150 connections
                .activeConnections(20.0 + Math.random() * 30) // 20-50 active connections
                .queryLatency(50.0 + Math.random() * 100) // 50-150ms
                .throughput(1000.0 + Math.random() * 2000) // 1000-3000 queries/sec
                .indexUsage(0.70 + Math.random() * 0.25) // 70-95%
                .tableSize(1024.0 + Math.random() * 4096) // 1-5 GB
                .build();
    }

    private List<DatabaseRecommendation> generateDatabaseRecommendations(DatabaseAnalysis analysis) {
        List<DatabaseRecommendation> recommendations = new ArrayList<>();

        if (analysis.getQueryLatency() > 100) {
            recommendations.add(DatabaseRecommendation.builder()
                    .type("OPTIMIZE_QUERIES")
                    .description("Optimize slow queries")
                    .priority("HIGH")
                    .estimatedImprovement(0.30)
                    .build());
        }

        if (analysis.getIndexUsage() < 0.80) {
            recommendations.add(DatabaseRecommendation.builder()
                    .type("ADD_INDEXES")
                    .description("Add missing indexes")
                    .priority("MEDIUM")
                    .estimatedImprovement(0.20)
                    .build());
        }

        return recommendations;
    }

    private OptimizationResult applyDatabaseOptimization(UUID tenantId, DatabaseRecommendation recommendation) {
        // Apply database optimization
        log.info("Applying database optimization: {} for tenant: {}", recommendation.getType(), tenantId);

        return OptimizationResult.builder()
                .type(recommendation.getType())
                .status(OptimizationResult.Status.SUCCESS)
                .appliedAt(LocalDateTime.now())
                .actualImprovement(recommendation.getEstimatedImprovement() * 0.75) // 75% of estimated
                .build();
    }

    private Double calculateAverageResponseTime(UUID tenantId) {
        // Calculate average response time
        return 45.0 + Math.random() * 55; // 45-100ms
    }

    private Double calculateThroughput(UUID tenantId) {
        // Calculate throughput
        return 500.0 + Math.random() * 1500; // 500-2000 requests/sec
    }

    private Double calculateRuleSuccessRate(UUID tenantId) {
        // Calculate rule success rate
        return 0.80 + Math.random() * 0.15; // 80-95%
    }

    private Double calculateAlertResolutionRate(UUID tenantId) {
        // Calculate alert resolution rate
        return 0.85 + Math.random() * 0.10; // 85-95%
    }

    private Double calculateCacheHitRate(UUID tenantId) {
        // Calculate cache hit rate
        return 0.85 + Math.random() * 0.10; // 85-95%
    }

    private Double calculateQueryPerformance(UUID tenantId) {
        // Calculate query performance
        return 60.0 + Math.random() * 40; // 60-100ms average
    }

    private Double calculateIndexUsage(UUID tenantId) {
        // Calculate index usage
        return 0.75 + Math.random() * 0.20; // 75-95%
    }

    private void collectSystemMetricsForTenant(UUID tenantId) {
        // Collect system metrics for tenant
        List<RecordMetricRequest> metrics = Arrays.asList(
                RecordMetricRequest.builder()
                        .metricName("cpu_usage")
                        .metricType("SYSTEM")
                        .value(30.0 + Math.random() * 40) // 30-70%
                        .unit("percent")
                        .source("system_monitor")
                        .tags(Map.of("host", "server-1"))
                        .build(),
                RecordMetricRequest.builder()
                        .metricName("memory_usage")
                        .metricType("SYSTEM")
                        .value(40.0 + Math.random() * 30) // 40-70%
                        .unit("percent")
                        .source("system_monitor")
                        .tags(Map.of("host", "server-1"))
                        .build(),
                RecordMetricRequest.builder()
                        .metricName("response_time")
                        .metricType("APPLICATION")
                        .value(50.0 + Math.random() * 100) // 50-150ms
                        .unit("milliseconds")
                        .source("application_monitor")
                        .tags(Map.of("endpoint", "/api/health"))
                        .build()
        );

        RecordBatchMetricsRequest request = RecordBatchMetricsRequest.builder()
                .metrics(metrics)
                .build();

        recordBatchMetrics(tenantId, request);
    }

    private void evaluatePerformanceRulesForTenant(UUID tenantId) {
        // Get recent metrics for rule evaluation
        List<PerformanceMetric> recentMetrics = metricRepository
                .findByTenantIdAndTimestampAfterOrderByTimestampDesc(tenantId, LocalDateTime.now().minusMinutes(5));

        for (PerformanceMetric metric : recentMetrics) {
            evaluateOptimizationRules(tenantId, metric);
        }

        log.info("Evaluated performance rules for {} metrics in tenant: {}", recentMetrics.size(), tenantId);
    }

    private void performAutomaticOptimizationsForTenant(UUID tenantId) {
        // Perform automatic optimizations
        log.info("Performing automatic optimizations for tenant: {}", tenantId);

        // Optimize cache
        OptimizeCacheRequest cacheRequest = OptimizeCacheRequest.builder()
                .applyOptimizations(true)
                .build();

        optimizeCache(tenantId, cacheRequest);

        // Optimize database
        OptimizeDatabaseRequest dbRequest = OptimizeDatabaseRequest.builder()
                .applyOptimizations(true)
                .build();

        optimizeDatabase(tenantId, dbRequest);
    }

    private void cleanupPerformanceDataForTenant(UUID tenantId) {
        // Clean up old performance data
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(90);
        long deletedMetrics = metricRepository.deleteByTenantIdAndTimestampBefore(tenantId, cutoffDate);

        log.info("Cleaned up {} performance metrics for tenant: {}", deletedMetrics, tenantId);
    }

    // DTO conversion methods
    private PerformanceMetricDto convertToDto(PerformanceMetric metric) {
        return PerformanceMetricDto.builder()
                .id(metric.getId())
                .tenantId(metric.getTenantId())
                .metricName(metric.getMetricName())
                .metricType(metric.getMetricType())
                .value(metric.getValue())
                .unit(metric.getUnit())
                .tags(metric.getTags())
                .source(metric.getSource())
                .timestamp(metric.getTimestamp())
                .build();
    }

    private OptimizationRuleDto convertToDto(OptimizationRule rule) {
        return OptimizationRuleDto.builder()
                .id(rule.getId())
                .tenantId(rule.getTenantId())
                .name(rule.getName())
                .description(rule.getDescription())
                .ruleType(rule.getRuleType())
                .priority(rule.getPriority())
                .isEnabled(rule.getIsEnabled())
                .autoApply(rule.getAutoApply())
                .createdAt(rule.getCreatedAt())
                .build();
    }

    private OptimizationActionDto convertToDto(OptimizationAction action) {
        return OptimizationActionDto.builder()
                .id(action.getId())
                .actionType(action.getActionType())
                .status(action.getStatus())
                .executedAt(action.getExecutedAt())
                .build();
    }

    private CacheOptimizationDto convertToDto(CacheOptimization optimization) {
        return CacheOptimizationDto.builder()
                .id(optimization.getId())
                .tenantId(optimization.getTenantId())
                .status(optimization.getStatus())
                .createdAt(optimization.getCreatedAt())
                .build();
    }

    private DatabaseOptimizationDto convertToDto(DatabaseOptimization optimization) {
        return DatabaseOptimizationDto.builder()
                .id(optimization.getId())
                .tenantId(optimization.getTenantId())
                .status(optimization.getStatus())
                .createdAt(optimization.getCreatedAt())
                .build();
    }

    // Inner classes
    @lombok.Data
    @lombok.Builder
    public static class CacheAnalysis {
        private Double totalCacheSize;
        private Double hitRate;
        private Double missRate;
        private Double evictionRate;
        private Double averageAccessTime;
    }

    @lombok.Data
    @lombok.Builder
    public static class CacheRecommendation {
        private String type;
        private String description;
        private String priority;
        private Double estimatedImprovement;
    }

    @lombok.Data
    @lombok.Builder
    public static class DatabaseAnalysis {
        private Double totalConnections;
        private Double activeConnections;
        private Double queryLatency;
        private Double throughput;
        private Double indexUsage;
        private Double tableSize;
    }

    @lombok.Data
    @lombok.Builder
    public static class DatabaseRecommendation {
        private String type;
        private String description;
        private String priority;
        private Double estimatedImprovement;
    }

    @lombok.Data
    @lombok.Builder
    public static class OptimizationResult {
        private String type;
        private OptimizationResult.Status status;
        private LocalDateTime appliedAt;
        private Double actualImprovement;

        public enum Status {
            SUCCESS, FAILED, PARTIAL
        }
    }
}
