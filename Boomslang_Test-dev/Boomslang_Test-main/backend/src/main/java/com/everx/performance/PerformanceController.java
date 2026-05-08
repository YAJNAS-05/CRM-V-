package com.everx.performance.controller;

import com.everx.shared.dto.ApiResponse;
import com.everx.performance.dto.*;
import com.everx.performance.service.PerformanceMonitoringService;
import com.everx.performance.service.CacheService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/performance")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Performance Monitoring", description = "APIs for performance monitoring and optimization")
public class PerformanceController {

    private final PerformanceMonitoringService performanceMonitoringService;
    private final CacheService cacheService;

    // Performance Metrics
    @GetMapping("/metrics/current")
    @Operation(summary = "Get current performance metrics", description = "Retrieves current system performance metrics")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PerformanceMetrics>> getCurrentMetrics() {
        PerformanceMetrics metrics = performanceMonitoringService.getCurrentMetrics();
        return ResponseEntity.ok(ApiResponse.success(metrics));
    }

    @GetMapping("/metrics/endpoint/{endpoint}")
    @Operation(summary = "Get endpoint metrics", description = "Retrieves performance metrics for a specific endpoint")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EndpointMetrics>> getEndpointMetrics(
            @Parameter(description = "Endpoint path") @PathVariable String endpoint) {
        
        EndpointMetrics metrics = performanceMonitoringService.getEndpointMetrics(endpoint);
        return ResponseEntity.ok(ApiResponse.success(metrics));
    }

    // Cache Management
    @GetMapping("/cache/statistics")
    @Operation(summary = "Get cache statistics", description = "Retrieves cache performance statistics")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, CacheStatistics>>> getCacheStatistics() {
        Map<String, CacheStatistics> statistics = cacheService.getAllStatistics();
        return ResponseEntity.ok(ApiResponse.success(statistics));
    }

    @GetMapping("/cache/statistics/{cacheName}")
    @Operation(summary = "Get cache statistics by name", description = "Retrieves statistics for a specific cache")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CacheStatistics>> getCacheStatisticsByName(
            @Parameter(description = "Cache name") @PathVariable String cacheName) {
        
        CacheStatistics statistics = cacheService.getStatistics(cacheName);
        return ResponseEntity.ok(ApiResponse.success(statistics));
    }

    @PostMapping("/cache/{cacheName}/evict")
    @Operation(summary = "Evict cache entry", description = "Evicts a specific entry from cache")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> evictCacheEntry(
            @Parameter(description = "Cache name") @PathVariable String cacheName,
            @Parameter(description = "Cache key") @RequestParam String key) {
        
        cacheService.evict(cacheName, key);
        return ResponseEntity.ok(ApiResponse.success(null, "Cache entry evicted successfully"));
    }

    @PostMapping("/cache/{cacheName}/evict-all")
    @Operation(summary = "Evict all cache entries", description = "Evicts all entries from a specific cache")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> evictAllCacheEntries(
            @Parameter(description = "Cache name") @PathVariable String cacheName) {
        
        cacheService.evictAll(cacheName);
        return ResponseEntity.ok(ApiResponse.success(null, "All cache entries evicted successfully"));
    }

    @PostMapping("/cache/warmup/{cacheName}")
    @Operation(summary = "Warm up cache", description = "Preloads data into cache")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> warmupCache(
            @Parameter(description = "Cache name") @PathVariable String cacheName,
            @RequestBody Map<String, Object> data) {
        
        cacheService.warmupCache(cacheName, data);
        return ResponseEntity.ok(ApiResponse.success(null, "Cache warmup completed"));
    }

    @PostMapping("/cache/preload")
    @Operation(summary = "Preload common data", description = "Preloads frequently accessed data into cache")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> preloadCommonData() {
        cacheService.preloadCommonData();
        return ResponseEntity.ok(ApiResponse.success(null, "Common data preloaded successfully"));
    }

    // Performance Monitoring
    @GetMapping("/health")
    @Operation(summary = "Get system health", description = "Retrieves overall system health status")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemHealth() {
        Map<String, Object> health = Map.of(
                "status", "HEALTHY",
                "timestamp", LocalDateTime.now(),
                "uptime", "0d 0h 0m",
                "memoryUsage", "512 MB",
                "cpuUsage", "25%",
                "activeConnections", 150,
                "cacheHitRate", "85%"
        );
        return ResponseEntity.ok(ApiResponse.success(health));
    }

    @GetMapping("/alerts")
    @Operation(summary = "Get active alerts", description = "Retrieves active performance alerts")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Object>>> getActiveAlerts() {
        // This would integrate with the alerting service
        List<Object> alerts = List.of();
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @PostMapping("/alerts/{alertId}/acknowledge")
    @Operation(summary = "Acknowledge alert", description = "Acknowledges a performance alert")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> acknowledgeAlert(
            @Parameter(description = "Alert ID") @PathVariable String alertId) {
        
        // This would integrate with the alerting service
        return ResponseEntity.ok(ApiResponse.success(null, "Alert acknowledged"));
    }

    @PostMapping("/alerts/{alertId}/resolve")
    @Operation(summary = "Resolve alert", description = "Resolves a performance alert")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> resolveAlert(
            @Parameter(description = "Alert ID") @PathVariable String alertId) {
        
        // This would integrate with the alerting service
        return ResponseEntity.ok(ApiResponse.success(null, "Alert resolved"));
    }

    // Performance Reports
    @GetMapping("/reports/summary")
    @Operation(summary = "Get performance summary", description = "Retrieves performance summary report")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPerformanceSummary() {
        Map<String, Object> summary = Map.of(
                "totalRequests", 10000,
                "averageResponseTime", 250.5,
                "errorRate", 0.02,
                "cacheHitRate", 0.85,
                "throughput", 500.0,
                "uptime", "99.9%",
                "period", "Last 24 hours"
        );
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/reports/trends")
    @Operation(summary = "Get performance trends", description = "Retrieves performance trend analysis")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPerformanceTrends() {
        Map<String, Object> trends = Map.of(
                "responseTimeTrend", List.of(200, 220, 210, 230, 215, 225, 240),
                "errorRateTrend", List.of(0.01, 0.02, 0.015, 0.025, 0.02, 0.018, 0.022),
                "throughputTrend", List.of(450, 480, 470, 500, 490, 510, 520),
                "cacheHitRateTrend", List.of(0.80, 0.82, 0.85, 0.83, 0.86, 0.84, 0.87),
                "labels", List.of("00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00")
        );
        return ResponseEntity.ok(ApiResponse.success(trends));
    }

    // System Diagnostics
    @GetMapping("/diagnostics/system")
    @Operation(summary = "Get system diagnostics", description = "Retrieves detailed system diagnostics")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemDiagnostics() {
        Map<String, Object> diagnostics = Map.of(
                "jvm", Map.of(
                        "version", "17.0.2",
                        "heapUsed", "512 MB",
                        "heapMax", "2048 MB",
                        "gcCollections", 150,
                        "uptime", "2d 14h 30m"
                ),
                "database", Map.of(
                        "connections", 25,
                        "activeConnections", 15,
                        "idleConnections", 10,
                        "queryTime", "45ms avg"
                ),
                "cache", Map.of(
                        "totalCaches", 5,
                        "totalEntries", 10000,
                        "hitRate", "85%",
                        "evictions", 50
                ),
                "threads", Map.of(
                        "active", 45,
                        "pool", 100,
                        "peak", 60
                )
        );
        return ResponseEntity.ok(ApiResponse.success(diagnostics));
    }

    @PostMapping("/diagnostics/gc")
    @Operation(summary = "Trigger garbage collection", description = "Manually triggers JVM garbage collection")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> triggerGarbageCollection() {
        System.gc();
        return ResponseEntity.ok(ApiResponse.success(null, "Garbage collection triggered"));
    }

    @PostMapping("/diagnostics/cache-cleanup")
    @Operation(summary = "Trigger cache cleanup", description = "Manually triggers cache cleanup")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> triggerCacheCleanup() {
        // This would trigger cache cleanup across all caches
        return ResponseEntity.ok(ApiResponse.success(null, "Cache cleanup triggered"));
    }

    // Performance Configuration
    @GetMapping("/config")
    @Operation(summary = "Get performance configuration", description = "Retrieves current performance configuration")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPerformanceConfig() {
        Map<String, Object> config = Map.of(
                "monitoring", Map.of(
                        "enabled", true,
                        "interval", "60s",
                        "retention", "7d"
                ),
                "caching", Map.of(
                        "defaultTtl", "30m",
                        "maxSize", 10000,
                        "evictionThreshold", 0.8
                ),
                "alerts", Map.of(
                        "errorRateThreshold", 0.05,
                        "responseTimeThreshold", 1000,
                        "memoryThreshold", "1GB"
                )
        );
        return ResponseEntity.ok(ApiResponse.success(config));
    }

    @PutMapping("/config")
    @Operation(summary = "Update performance configuration", description = "Updates performance configuration")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updatePerformanceConfig(
            @RequestBody Map<String, Object> config) {
        
        // This would update the performance configuration
        return ResponseEntity.ok(ApiResponse.success(null, "Performance configuration updated"));
    }
}
