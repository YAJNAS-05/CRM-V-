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
public class AlertingService {

    // Alert storage (in production, use a proper alerting system)
    private final Map<String, List<Alert>> alertStorage = new ConcurrentHashMap<>();
    
    // Alert thresholds
    private static final double CRITICAL_ERROR_RATE = 0.10; // 10%
    private static final double WARNING_ERROR_RATE = 0.05; // 5%
    private static final long CRITICAL_MEMORY_MB = 2048; // 2GB
    private static final long WARNING_MEMORY_MB = 1024; // 1GB
    private static final double CRITICAL_CPU_USAGE = 0.90; // 90%
    private static final double WARNING_CPU_USAGE = 0.80; // 80%

    public void sendErrorRateAlert(String endpoint, double errorRate) {
        AlertSeverity severity = errorRate >= CRITICAL_ERROR_RATE ? AlertSeverity.CRITICAL : AlertSeverity.WARNING;
        
        Alert alert = Alert.builder()
                .id(java.util.UUID.randomUUID().toString())
                .type("ERROR_RATE")
                .severity(severity)
                .message(String.format("High error rate detected for endpoint %s: %.2f%%", endpoint, errorRate * 100))
                .source(endpoint)
                .timestamp(LocalDateTime.now())
                .metadata(Map.of(
                        "error_rate", errorRate,
                        "endpoint", endpoint,
                        "threshold", severity == AlertSeverity.CRITICAL ? CRITICAL_ERROR_RATE : WARNING_ERROR_RATE
                ))
                .build();
        
        sendAlert(alert);
        log.warn("Error rate alert sent: {} - {}", endpoint, alert.getMessage());
    }

    public void sendMemoryAlert(long memoryUsageMB) {
        AlertSeverity severity = memoryUsageMB >= CRITICAL_MEMORY_MB ? AlertSeverity.CRITICAL : AlertSeverity.WARNING;
        
        Alert alert = Alert.builder()
                .id(java.util.UUID.randomUUID().toString())
                .type("MEMORY_USAGE")
                .severity(severity)
                .message(String.format("High memory usage detected: %d MB", memoryUsageMB))
                .source("system")
                .timestamp(LocalDateTime.now())
                .metadata(Map.of(
                        "memory_usage_mb", memoryUsageMB,
                        "threshold", severity == AlertSeverity.CRITICAL ? CRITICAL_MEMORY_MB : WARNING_MEMORY_MB
                ))
                .build();
        
        sendAlert(alert);
        log.warn("Memory usage alert sent: {} MB - {}", memoryUsageMB, alert.getMessage());
    }

    public void sendCpuAlert(double cpuUsage) {
        AlertSeverity severity = cpuUsage >= CRITICAL_CPU_USAGE ? AlertSeverity.CRITICAL : AlertSeverity.WARNING;
        
        Alert alert = Alert.builder()
                .id(java.util.UUID.randomUUID().toString())
                .type("CPU_USAGE")
                .severity(severity)
                .message(String.format("High CPU usage detected: %.2f%%", cpuUsage * 100))
                .source("system")
                .timestamp(LocalDateTime.now())
                .metadata(Map.of(
                        "cpu_usage", cpuUsage,
                        "threshold", severity == AlertSeverity.CRITICAL ? CRITICAL_CPU_USAGE : WARNING_CPU_USAGE
                ))
                .build();
        
        sendAlert(alert);
        log.warn("CPU usage alert sent: {:.2f}% - {}", cpuUsage * 100, alert.getMessage());
    }

    public void sendResponseTimeAlert(String endpoint, long responseTimeMs) {
        AlertSeverity severity = responseTimeMs >= 5000 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING;
        
        Alert alert = Alert.builder()
                .id(java.util.UUID.randomUUID().toString())
                .type("RESPONSE_TIME")
                .severity(severity)
                .message(String.format("Slow response time detected for %s: %d ms", endpoint, responseTimeMs))
                .source(endpoint)
                .timestamp(LocalDateTime.now())
                .metadata(Map.of(
                        "response_time_ms", responseTimeMs,
                        "endpoint", endpoint
                ))
                .build();
        
        sendAlert(alert);
        log.warn("Response time alert sent: {} - {}ms", endpoint, responseTimeMs);
    }

    public void sendServiceHealthAlert(String serviceName, boolean isHealthy) {
        if (!isHealthy) {
            Alert alert = Alert.builder()
                    .id(java.util.UUID.randomUUID().toString())
                    .type("SERVICE_HEALTH")
                    .severity(AlertSeverity.CRITICAL)
                    .message(String.format("Service %s is unhealthy", serviceName))
                    .source(serviceName)
                    .timestamp(LocalDateTime.now())
                    .metadata(Map.of(
                            "service_name", serviceName,
                            "healthy", false
                    ))
                    .build();
            
            sendAlert(alert);
            log.error("Service health alert sent: {} is unhealthy", serviceName);
        }
    }

    public void sendCustomAlert(String type, String message, AlertSeverity severity, String source, Map<String, Object> metadata) {
        Alert alert = Alert.builder()
                .id(java.util.UUID.randomUUID().toString())
                .type(type)
                .severity(severity)
                .message(message)
                .source(source)
                .timestamp(LocalDateTime.now())
                .metadata(metadata)
                .build();
        
        sendAlert(alert);
        log.info("Custom alert sent: {} - {}", type, message);
    }

    public List<Alert> getAlerts(String type, LocalDateTime since) {
        List<Alert> alerts = alertStorage.get(type);
        if (alerts == null) return List.of();
        
        return alerts.stream()
                .filter(alert -> alert.getTimestamp().isAfter(since))
                .toList();
    }

    public List<Alert> getActiveAlerts() {
        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
        
        return alertStorage.values().stream()
                .flatMap(List::stream)
                .filter(alert -> alert.getTimestamp().isAfter(fiveMinutesAgo))
                .sorted((a1, a2) -> a2.getTimestamp().compareTo(a1.getTimestamp()))
                .toList();
    }

    public void acknowledgeAlert(String alertId) {
        alertStorage.values().stream()
                .flatMap(List::stream)
                .filter(alert -> alert.getId().equals(alertId))
                .forEach(alert -> {
                    alert.setAcknowledged(true);
                    alert.setAcknowledgedAt(LocalDateTime.now());
                });
        
        log.info("Alert acknowledged: {}", alertId);
    }

    public void resolveAlert(String alertId) {
        alertStorage.values().stream()
                .flatMap(List::stream)
                .filter(alert -> alert.getId().equals(alertId))
                .forEach(alert -> {
                    alert.setResolved(true);
                    alert.setResolvedAt(LocalDateTime.now());
                });
        
        log.info("Alert resolved: {}", alertId);
    }

    private void sendAlert(Alert alert) {
        // Store alert
        alertStorage.computeIfAbsent(alert.getType(), k -> new java.util.ArrayList<>()).add(alert);
        
        // Keep only last 1000 alerts per type
        List<Alert> alerts = alertStorage.get(alert.getType());
        if (alerts.size() > 1000) {
            alerts = alerts.subList(alerts.size() - 1000, alerts.size());
            alertStorage.put(alert.getType(), alerts);
        }
        
        // Send notifications (in production, integrate with email, Slack, etc.)
        sendNotification(alert);
    }

    private void sendNotification(Alert alert) {
        // Mock notification sending - in production, integrate with actual notification channels
        switch (alert.getSeverity()) {
            case CRITICAL:
                log.error("🚨 CRITICAL ALERT: {}", alert.getMessage());
                // Send SMS, call, or immediate notification
                break;
            case WARNING:
                log.warn("⚠️ WARNING ALERT: {}", alert.getMessage());
                // Send email or Slack notification
                break;
            case INFO:
                log.info("ℹ️ INFO ALERT: {}", alert.getMessage());
                // Send email notification
                break;
        }
    }

    // Inner classes
    public enum AlertSeverity {
        INFO, WARNING, CRITICAL
    }

    @lombok.Data
    @lombok.Builder
    public static class Alert {
        private String id;
        private String type;
        private AlertSeverity severity;
        private String message;
        private String source;
        private LocalDateTime timestamp;
        private Map<String, Object> metadata;
        private boolean acknowledged = false;
        private LocalDateTime acknowledgedAt;
        private boolean resolved = false;
        private LocalDateTime resolvedAt;
    }
}
