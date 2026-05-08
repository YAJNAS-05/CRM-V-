package com.everx.performance.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class MetricsCollectorService {

    // In-memory storage for metrics (in production, use a proper time-series database)
    private final Map<String, List<MetricData>> metricsStorage = new ConcurrentHashMap<>();

    public void recordSlowRequest(String endpoint, long responseTimeMs) {
        String key = "slow_requests:" + endpoint;
        MetricData metric = MetricData.builder()
                .timestamp(LocalDateTime.now())
                .value(responseTimeMs)
                .tags(Map.of("endpoint", endpoint, "type", "slow_request"))
                .build();
        
        addMetric(key, metric);
        log.warn("Recorded slow request metric: {} -> {}ms", endpoint, responseTimeMs);
    }

    public void recordSystemMetrics(long memoryUsageMB, double cpuUsage) {
        MetricData memoryMetric = MetricData.builder()
                .timestamp(LocalDateTime.now())
                .value(memoryUsageMB)
                .tags(Map.of("type", "memory_usage", "unit", "MB"))
                .build();
        
        MetricData cpuMetric = MetricData.builder()
                .timestamp(LocalDateTime.now())
                .value(cpuUsage * 100) // Convert to percentage
                .tags(Map.of("type", "cpu_usage", "unit", "percent"))
                .build();
        
        addMetric("system_memory", memoryMetric);
        addMetric("system_cpu", cpuMetric);
        
        log.debug("Recorded system metrics: Memory={}MB, CPU={}%", memoryUsageMB, cpuUsage * 100);
    }

    public void storePerformanceReport(PerformanceReport report) {
        MetricData metric = MetricData.builder()
                .timestamp(LocalDateTime.now())
                .value(report.getTotalRequests())
                .tags(Map.of("type", "performance_report", "error_rate", String.valueOf(report.getErrorRate())))
                .build();
        
        addMetric("performance_reports", metric);
        log.info("Stored performance report: {}", report.getSummary());
    }

    public void storeHealthMetrics(Map<String, Boolean> healthStatus) {
        long healthyServices = healthStatus.values().stream().mapToLong(healthy -> healthy ? 1 : 0).sum();
        
        MetricData metric = MetricData.builder()
                .timestamp(LocalDateTime.now())
                .value(healthyServices)
                .tags(Map.of("type", "health_check", "total_services", String.valueOf(healthStatus.size())))
                .build();
        
        addMetric("health_metrics", metric);
        log.debug("Stored health metrics: {}/{} services healthy", healthyServices, healthStatus.size());
    }

    public List<MetricData> getMetrics(String metricName, LocalDateTime since) {
        List<MetricData> metrics = metricsStorage.get(metricName);
        if (metrics == null) return List.of();
        
        return metrics.stream()
                .filter(metric -> metric.getTimestamp().isAfter(since))
                .toList();
    }

    public void cleanupOldMetrics(LocalDateTime cutoff) {
        int removedCount = 0;
        for (Map.Entry<String, List<MetricData>> entry : metricsStorage.entrySet()) {
            List<MetricData> metrics = entry.getValue();
            int initialSize = metrics.size();
            
            metrics.removeIf(metric -> metric.getTimestamp().isBefore(cutoff));
            removedCount += (initialSize - metrics.size());
        }
        
        log.info("Cleaned up {} old metrics entries", removedCount);
    }

    private void addMetric(String key, MetricData metric) {
        metricsStorage.computeIfAbsent(key, k -> new java.util.ArrayList<>()).add(metric);
        
        // Keep only last 1000 entries per metric to prevent memory issues
        List<MetricData> metrics = metricsStorage.get(key);
        if (metrics.size() > 1000) {
            metrics = metrics.subList(metrics.size() - 1000, metrics.size());
            metricsStorage.put(key, metrics);
        }
    }

    // Inner classes for metrics data structures
    @lombok.Data
    @lombok.Builder
    public static class MetricData {
        private LocalDateTime timestamp;
        private double value;
        private Map<String, String> tags;
    }

    @lombok.Data
    @lombok.Builder
    public static class PerformanceReport {
        private LocalDateTime timestamp;
        private long totalRequests;
        private long totalErrors;
        private double averageResponseTime;
        private double errorRate;
        private double cacheHitRate;
        private long memoryUsageMB;
        private double cpuUsage;
        private List<String> topSlowEndpoints;
        private List<String> topErrorEndpoints;
        
        public String getSummary() {
            return String.format("Requests: %d, Errors: %d, Avg Response: %.2fms, Error Rate: %.2f%%", 
                    totalRequests, totalErrors, averageResponseTime, errorRate * 100);
        }
    }
}
