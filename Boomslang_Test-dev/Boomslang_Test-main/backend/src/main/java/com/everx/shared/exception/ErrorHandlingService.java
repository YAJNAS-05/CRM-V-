package com.everx.shared.exception;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class ErrorHandlingService {

    private final NotificationService notificationService;
    
    // Error tracking
    private final Map<String, ErrorStatistics> errorStats = new ConcurrentHashMap<>();
    
    // Error thresholds
    private static final int ERROR_THRESHOLD = 10; // Alert after 10 errors of same type
    private static final int CRITICAL_ERROR_THRESHOLD = 50; // Critical alert after 50 errors

    public void handleError(Exception exception, String context, Map<String, Object> additionalInfo) {
        String errorType = exception.getClass().getSimpleName();
        String errorMessage = exception.getMessage();
        
        // Log the error
        log.error("Error in {}: {} - {}", context, errorType, errorMessage, exception);
        
        // Track error statistics
        trackError(errorType, errorMessage, context);
        
        // Create error record
        ErrorRecord errorRecord = ErrorRecord.builder()
                .id(UUID.randomUUID().toString())
                .type(errorType)
                .message(errorMessage)
                .context(context)
                .timestamp(LocalDateTime.now())
                .stackTrace(getStackTrace(exception))
                .additionalInfo(additionalInfo)
                .build();
        
        // Store error record
        storeErrorRecord(errorRecord);
        
        // Check if alert is needed
        checkAndSendAlert(errorType, errorRecord);
        
        // Attempt error recovery if possible
        attemptErrorRecovery(exception, context, additionalInfo);
    }

    public void handleBusinessError(String errorCode, String message, String context, Map<String, Object> details) {
        log.warn("Business error in {}: {} - {}", context, errorCode, message);
        
        // Track business error
        trackError("BUSINESS_ERROR", message, context);
        
        // Create business error record
        ErrorRecord errorRecord = ErrorRecord.builder()
                .id(UUID.randomUUID().toString())
                .type("BUSINESS_ERROR")
                .errorCode(errorCode)
                .message(message)
                .context(context)
                .timestamp(LocalDateTime.now())
                .additionalInfo(details)
                .build();
        
        // Store error record
        storeErrorRecord(errorRecord);
        
        // Send notification for critical business errors
        if (isCriticalBusinessError(errorCode)) {
            sendCriticalAlert(errorRecord);
        }
    }

    public void handleValidationError(String field, String message, String context, Object invalidValue) {
        log.warn("Validation error in {}: {} - {}", context, field, message);
        
        Map<String, Object> details = Map.of(
                "field", field,
                "invalidValue", invalidValue,
                "validationMessage", message
        );
        
        // Track validation error
        trackError("VALIDATION_ERROR", message, context);
        
        // Create validation error record
        ErrorRecord errorRecord = ErrorRecord.builder()
                .id(UUID.randomUUID().toString())
                .type("VALIDATION_ERROR")
                .message(message)
                .context(context)
                .timestamp(LocalDateTime.now())
                .additionalInfo(details)
                .build();
        
        // Store error record
        storeErrorRecord(errorRecord);
    }

    public void handleSecurityError(String eventType, String message, String context, Map<String, Object> securityInfo) {
        log.error("Security error in {}: {} - {}", context, eventType, message);
        
        // Track security error
        trackError("SECURITY_ERROR", message, context);
        
        // Create security error record
        ErrorRecord errorRecord = ErrorRecord.builder()
                .id(UUID.randomUUID().toString())
                .type("SECURITY_ERROR")
                .eventType(eventType)
                .message(message)
                .context(context)
                .timestamp(LocalDateTime.now())
                .additionalInfo(securityInfo)
                .severity(ErrorSeverity.CRITICAL)
                .build();
        
        // Store error record
        storeErrorRecord(errorRecord);
        
        // Always send alerts for security errors
        sendCriticalAlert(errorRecord);
        
        // Notify security team
        notifySecurityTeam(errorRecord);
    }

    public void handlePerformanceIssue(String metric, String issue, String context, Map<String, Object> performanceData) {
        log.warn("Performance issue in {}: {} - {}", context, metric, issue);
        
        // Track performance issue
        trackError("PERFORMANCE_ISSUE", issue, context);
        
        // Create performance error record
        ErrorRecord errorRecord = ErrorRecord.builder()
                .id(UUID.randomUUID().toString())
                .type("PERFORMANCE_ISSUE")
                .message(issue)
                .context(context)
                .timestamp(LocalDateTime.now())
                .additionalInfo(performanceData)
                .severity(ErrorSeverity.WARNING)
                .build();
        
        // Store error record
        storeErrorRecord(errorRecord);
        
        // Check if performance issue is severe enough for alert
        if (isSeverePerformanceIssue(performanceData)) {
            sendAlert(errorRecord);
        }
    }

    public ErrorStatistics getErrorStatistics(String errorType) {
        return errorStats.getOrDefault(errorType, new ErrorStatistics());
    }

    public Map<String, ErrorStatistics> getAllErrorStatistics() {
        return new HashMap<>(errorStats);
    }

    public void resetErrorStatistics() {
        errorStats.clear();
        log.info("Error statistics reset");
    }

    // Private helper methods
    private void trackError(String errorType, String message, String context) {
        ErrorStatistics stats = errorStats.computeIfAbsent(errorType, k -> new ErrorStatistics());
        stats.incrementCount();
        stats.updateLastOccurrence();
        
        // Track by context if needed
        stats.addContext(context);
    }

    private void storeErrorRecord(ErrorRecord errorRecord) {
        // In production, store in database or logging system
        // For now, we'll just log it
        log.debug("Stored error record: {} - {}", errorRecord.getType(), errorRecord.getMessage());
    }

    private void checkAndSendAlert(String errorType, ErrorRecord errorRecord) {
        ErrorStatistics stats = errorStats.get(errorType);
        if (stats != null) {
            if (stats.getCount() >= CRITICAL_ERROR_THRESHOLD) {
                sendCriticalAlert(errorRecord);
            } else if (stats.getCount() >= ERROR_THRESHOLD) {
                sendAlert(errorRecord);
            }
        }
    }

    private void sendAlert(ErrorRecord errorRecord) {
        String alertMessage = String.format("Alert: %s error in %s - %s (Count: %d)", 
                errorRecord.getType(), 
                errorRecord.getContext(), 
                errorRecord.getMessage(),
                errorStats.getOrDefault(errorRecord.getType(), new ErrorStatistics()).getCount());
        
        notificationService.sendAlert(alertMessage, errorRecord);
    }

    private void sendCriticalAlert(ErrorRecord errorRecord) {
        String alertMessage = String.format("CRITICAL ALERT: %s error in %s - %s", 
                errorRecord.getType(), 
                errorRecord.getContext(), 
                errorRecord.getMessage());
        
        notificationService.sendCriticalAlert(alertMessage, errorRecord);
    }

    private void notifySecurityTeam(ErrorRecord errorRecord) {
        String securityMessage = String.format("SECURITY INCIDENT: %s - %s", 
                errorRecord.getEventType(), 
                errorRecord.getMessage());
        
        notificationService.notifySecurityTeam(securityMessage, errorRecord);
    }

    private void attemptErrorRecovery(Exception exception, String context, Map<String, Object> additionalInfo) {
        try {
            // Attempt recovery based on error type and context
            if (exception instanceof BusinessException) {
                // Business logic recovery
                attemptBusinessRecovery((BusinessException) exception, context, additionalInfo);
            } else if (exception instanceof RuntimeException) {
                // Runtime error recovery
                attemptRuntimeRecovery((RuntimeException) exception, context, additionalInfo);
            }
            
        } catch (Exception recoveryException) {
            log.error("Error recovery failed for {}: {}", context, recoveryException.getMessage(), recoveryException);
        }
    }

    private void attemptBusinessRecovery(BusinessException exception, String context, Map<String, Object> additionalInfo) {
        log.info("Attempting business recovery for {}: {}", context, exception.getMessage());
        // Implement business-specific recovery logic
    }

    private void attemptRuntimeRecovery(RuntimeException exception, String context, Map<String, Object> additionalInfo) {
        log.info("Attempting runtime recovery for {}: {}", context, exception.getMessage());
        // Implement runtime-specific recovery logic
    }

    private boolean isCriticalBusinessError(String errorCode) {
        return errorCode.startsWith("CRITICAL_") || 
               errorCode.equals("SUBSCRIPTION_LIMIT_EXCEEDED") ||
               errorCode.equals("TENANT_SUSPENDED");
    }

    private boolean isSeverePerformanceIssue(Map<String, Object> performanceData) {
        if (performanceData == null) return false;
        
        Object responseTime = performanceData.get("responseTime");
        Object errorRate = performanceData.get("errorRate");
        Object memoryUsage = performanceData.get("memoryUsage");
        
        boolean severe = false;
        
        if (responseTime instanceof Number && ((Number) responseTime).longValue() > 5000) {
            severe = true;
        }
        
        if (errorRate instanceof Number && ((Number) errorRate).doubleValue() > 0.1) {
            severe = true;
        }
        
        if (memoryUsage instanceof Number && ((Number) memoryUsage).longValue() > 2048) { // 2GB
            severe = true;
        }
        
        return severe;
    }

    private String getStackTrace(Exception exception) {
        java.io.StringWriter sw = new java.io.StringWriter();
        java.io.PrintWriter pw = new java.io.PrintWriter(sw);
        exception.printStackTrace(pw);
        return sw.toString();
    }

    // Inner classes
    public enum ErrorSeverity {
        INFO, WARNING, ERROR, CRITICAL
    }

    @lombok.Data
    @lombok.Builder
    public static class ErrorRecord {
        private String id;
        private String type;
        private String errorCode;
        private String eventType;
        private String message;
        private String context;
        private LocalDateTime timestamp;
        private String stackTrace;
        private Map<String, Object> additionalInfo;
        private ErrorSeverity severity = ErrorSeverity.ERROR;
    }

    @lombok.Data
    public static class ErrorStatistics {
        private int count = 0;
        private LocalDateTime firstOccurrence = LocalDateTime.now();
        private LocalDateTime lastOccurrence = LocalDateTime.now();
        private Map<String, Integer> contextCounts = new HashMap<>();

        public void incrementCount() {
            this.count++;
            this.lastOccurrence = LocalDateTime.now();
        }

        public void updateLastOccurrence() {
            this.lastOccurrence = LocalDateTime.now();
        }

        public void addContext(String context) {
            contextCounts.merge(context, 1, Integer::sum);
        }
    }

    // Service interface for notifications
    public interface NotificationService {
        void sendAlert(String message, ErrorRecord errorRecord);
        void sendCriticalAlert(String message, ErrorRecord errorRecord);
        void notifySecurityTeam(String message, ErrorRecord errorRecord);
    }
}
