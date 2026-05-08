package com.everx.performance.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
@Slf4j
public class PerformanceMonitoringService {

    private final MetricsCollectorService metricsCollector;
    private final AlertingService alertingService;

    // Performance metrics storage
    private final Map<String, AtomicLong> requestCounts = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> responseTimes = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> errorCounts = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> activeConnections = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> cacheHits = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> cacheMisses = new ConcurrentHashMap<>();

    // Performance thresholds
    private static final long SLOW_RESPONSE_THRESHOLD_MS = 1000;
    private static final double ERROR_RATE_THRESHOLD = 0.05; // 5%
    private static final long MEMORY_USAGE_THRESHOLD_MB = 1024; // 1GB
    private static final double CPU_USAGE_THRESHOLD = 0.80; // 80%

    @Async
    public void recordRequest(String endpoint, long responseTimeMs, boolean success) {
        String key = normalizeEndpoint(endpoint);
        
        requestCounts.computeIfAbsent(key, k -> new AtomicLong(0)).incrementAndGet();
        responseTimes.computeIfAbsent(key, k -> new AtomicLong(0)).addAndGet(responseTimeMs);
        
        if (!success) {
            errorCounts.computeIfAbsent(key, k -> new AtomicLong(0)).incrementAndGet();
        }

        // Check for performance issues
        if (responseTimeMs > SLOW_RESPONSE_THRESHOLD_MS) {
            log.warn("Slow request detected: {} took {}ms", endpoint, responseTimeMs);
            metricsCollector.recordSlowRequest(endpoint, responseTimeMs);
        }

        // Check error rate
        double errorRate = calculateErrorRate(key);
        if (errorRate > ERROR_RATE_THRESHOLD) {
            log.warn("High error rate detected for {}: {}%", key, errorRate * 100);
            alertingService.sendErrorRateAlert(key, errorRate);
        }
    }

    @Async
    public void recordCacheHit(String cacheKey) {
        cacheHits.computeIfAbsent(cacheKey, k -> new AtomicLong(0)).incrementAndGet();
    }

    @Async
    public void recordCacheMiss(String cacheKey) {
        cacheMisses.computeIfAbsent(cacheKey, k -> new AtomicLong(0)).incrementAndGet();
    }

    @Async
    public void recordConnection(String endpoint) {
        String key = normalizeEndpoint(endpoint);
        activeConnections.computeIfAbsent(key, k -> new AtomicLong(0)).incrementAndGet();
    }

    @Async
    public void recordDisconnection(String endpoint) {
        String key = normalizeEndpoint(endpoint);
        activeConnections.computeIfAbsent(key, k -> new AtomicLong(0)).decrementAndGet();
    }

    @Scheduled(fixedRate = 60000) // Every minute
    public void collectSystemMetrics() {
        try {
            // Memory usage
            Runtime runtime = Runtime.getRuntime();
            long totalMemory = runtime.totalMemory();
            long freeMemory = runtime.freeMemory();
            long usedMemory = totalMemory - freeMemory;
            long usedMemoryMB = usedMemory / (1024 * 1024);

            if (usedMemoryMB > MEMORY_USAGE_THRESHOLD_MB) {
                log.warn("High memory usage detected: {}MB", usedMemoryMB);
                alertingService.sendMemoryAlert(usedMemoryMB);
            }

            // CPU usage (simplified - in production use a proper monitoring library)
            double cpuUsage = getCpuUsage();
            if (cpuUsage > CPU_USAGE_THRESHOLD) {
                log.warn("High CPU usage detected: {}%", cpuUsage * 100);
                alertingService.sendCpuAlert(cpuUsage);
            }

            // Record metrics
            metricsCollector.recordSystemMetrics(usedMemoryMB, cpuUsage);

        } catch (Exception e) {
            log.error("Error collecting system metrics", e);
        }
    }

    @Scheduled(fixedRate = 300000) // Every 5 minutes
    public void generatePerformanceReport() {
        try {
            PerformanceReport report = generateReport();
            log.info("Performance report generated: {}", report.getSummary());
            metricsCollector.storePerformanceReport(report);
        } catch (Exception e) {
            log.error("Error generating performance report", e);
        }
    }

    @Scheduled(fixedRate = 3600000) // Every hour
    public void cleanupOldMetrics() {
        try {
            // Remove old metrics to prevent memory leaks
            LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
            metricsCollector.cleanupOldMetrics(cutoff);
            log.info("Cleaned up old performance metrics");
        } catch (Exception e) {
            log.error("Error cleaning up old metrics", e);
        }
    }

    public PerformanceMetrics getCurrentMetrics() {
        return PerformanceMetrics.builder()
                .totalRequests(requestCounts.values().stream().mapToLong(AtomicLong::get).sum())
                .totalErrors(errorCounts.values().stream().mapToLong(AtomicLong::get).sum())
                .averageResponseTime(calculateAverageResponseTime())
                .activeConnections(activeConnections.values().stream().mapToLong(AtomicLong::get).sum())
                .cacheHits(cacheHits.values().stream().mapToLong(AtomicLong::get).sum())
                .cacheMisses(cacheMisses.values().stream().mapToLong(AtomicLong::get).sum())
                .errorRate(calculateOverallErrorRate())
                .cacheHitRate(calculateCacheHitRate())
                .timestamp(LocalDateTime.now())
                .build();
    }

    public EndpointMetrics getEndpointMetrics(String endpoint) {
        String key = normalizeEndpoint(endpoint);
        
        return EndpointMetrics.builder()
                .endpoint(endpoint)
                .requestCount(requestCounts.getOrDefault(key, new AtomicLong(0)).get())
                .errorCount(errorCounts.getOrDefault(key, new AtomicLong(0)).get())
                .averageResponseTime(calculateAverageResponseTime(key))
                .errorRate(calculateErrorRate(key))
                .activeConnections(activeConnections.getOrDefault(key, new AtomicLong(0)).get())
                .build();
    }

    // Private helper methods
    private String normalizeEndpoint(String endpoint) {
        // Remove query parameters and normalize path
        if (endpoint == null) return "unknown";
        return endpoint.split("\\?")[0].toLowerCase();
    }

    private double calculateErrorRate(String endpoint) {
        AtomicLong requests = requestCounts.get(endpoint);
        AtomicLong errors = errorCounts.get(endpoint);
        
        if (requests == null || requests.get() == 0) return 0.0;
        return (double) errors.get() / requests.get();
    }

    private double calculateOverallErrorRate() {
        long totalRequests = requestCounts.values().stream().mapToLong(AtomicLong::get).sum();
        long totalErrors = errorCounts.values().stream().mapToLong(AtomicLong::get).sum();
        
        if (totalRequests == 0) return 0.0;
        return (double) totalErrors / totalRequests;
    }

    private double calculateAverageResponseTime(String endpoint) {
        AtomicLong requests = requestCounts.get(endpoint);
        AtomicLong totalTime = responseTimes.get(endpoint);
        
        if (requests == null || requests.get() == 0) return 0.0;
        return (double) totalTime.get() / requests.get();
    }

    private double calculateAverageResponseTime() {
        long totalRequests = requestCounts.values().stream().mapToLong(AtomicLong::get).sum();
        long totalTime = responseTimes.values().stream().mapToLong(AtomicLong::get).sum();
        
        if (totalRequests == 0) return 0.0;
        return (double) totalTime / totalRequests;
    }

    private double calculateCacheHitRate() {
        long hits = cacheHits.values().stream().mapToLong(AtomicLong::get).sum();
        long misses = cacheMisses.values().stream().mapToLong(AtomicLong::get).sum();
        long total = hits + misses;
        
        if (total == 0) return 0.0;
        return (double) hits / total;
    }

    private double getCpuUsage() {
        // Simplified CPU usage calculation
        // In production, use a proper monitoring library like Micrometer
        try {
            OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
            return osBean.getProcessCpuLoad();
        } catch (Exception e) {
            return 0.0;
        }
    }

    private PerformanceReport generateReport() {
        return PerformanceReport.builder()
                .timestamp(LocalDateTime.now())
                .totalRequests(getCurrentMetrics().getTotalRequests())
                .totalErrors(getCurrentMetrics().getTotalErrors())
                .averageResponseTime(getCurrentMetrics().getAverageResponseTime())
                .errorRate(getCurrentMetrics().getErrorRate())
                .cacheHitRate(getCurrentMetrics().getCacheHitRate())
                .memoryUsageMB(getMemoryUsageMB())
                .cpuUsage(getCpuUsage())
                .topSlowEndpoints(getTopSlowEndpoints())
                .topErrorEndpoints(getTopErrorEndpoints())
                .build();
    }

    private List<String> getTopSlowEndpoints() {
        return responseTimes.entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue().get(), e1.getValue().get()))
                .limit(5)
                .map(Map.Entry::getKey)
                .toList();
    }

    private List<String> getTopErrorEndpoints() {
        return errorCounts.entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue().get(), e1.getValue().get()))
                .limit(5)
                .map(Map.Entry::getKey)
                .toList();
    }

    private long getMemoryUsageMB() {
        Runtime runtime = Runtime.getRuntime();
        return (runtime.totalMemory() - runtime.freeMemory()) / (1024 * 1024);
    }
}
