package com.everx.backend.shared.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for structured audit logging in JSON format
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StructuredAuditLogger {
    
    private final ObjectMapper objectMapper;
    
    /**
     * Log an audit event
     */
    public void logAuditEvent(AuditEvent event) {
        try {
            String jsonEvent = objectMapper.writeValueAsString(event);
            log.info("AUDIT_EVENT: {}", jsonEvent);
        } catch (Exception e) {
            log.error("Failed to serialize audit event", e);
        }
    }
    
    /**
     * Log a create operation
     */
    public void logCreateOperation(String entityType, String entityId, Map<String, Object> newValues, String userId) {
        AuditEvent event = AuditEvent.builder()
                .timestamp(ZonedDateTime.now())
                .action("CREATE")
                .entityType(entityType)
                .entityId(entityId)
                .operationType("INSERT")
                .newValues(newValues)
                .userId(userId)
                .changeSummary("Created new " + entityType)
                .status("SUCCESS")
                .build();
        
        logAuditEvent(event);
    }
    
    /**
     * Log an update operation
     */
    public void logUpdateOperation(String entityType, String entityId, Map<String, Object> oldValues, 
                                   Map<String, Object> newValues, String userId) {
        Map<String, Object> changes = new HashMap<>();
        
        // Find what changed
        for (String key : newValues.keySet()) {
            Object oldValue = oldValues.get(key);
            Object newValue = newValues.get(key);
            
            if (oldValue == null || !oldValue.equals(newValue)) {
                Map<String, Object> change = new HashMap<>();
                change.put("old", oldValue);
                change.put("new", newValue);
                changes.put(key, change);
            }
        }
        
        AuditEvent event = AuditEvent.builder()
                .timestamp(ZonedDateTime.now())
                .action("UPDATE")
                .entityType(entityType)
                .entityId(entityId)
                .operationType("UPDATE")
                .oldValues(oldValues)
                .newValues(newValues)
                .userId(userId)
                .changeSummary("Updated " + changes.size() + " field(s)")
                .status("SUCCESS")
                .build();
        
        logAuditEvent(event);
    }
    
    /**
     * Log a delete operation
     */
    public void logDeleteOperation(String entityType, String entityId, Map<String, Object> oldValues, String userId) {
        AuditEvent event = AuditEvent.builder()
                .timestamp(ZonedDateTime.now())
                .action("DELETE")
                .entityType(entityType)
                .entityId(entityId)
                .operationType("DELETE")
                .oldValues(oldValues)
                .userId(userId)
                .changeSummary("Deleted " + entityType)
                .status("SUCCESS")
                .build();
        
        logAuditEvent(event);
    }
    
    /**
     * Log a security event
     */
    public void logSecurityEvent(String eventType, String severity, String description, String userId) {
        AuditEvent event = AuditEvent.builder()
                .timestamp(ZonedDateTime.now())
                .action(eventType)
                .operationType("SECURITY")
                .userId(userId)
                .changeSummary(description)
                .status(severity)
                .build();
        
        logAuditEvent(event);
    }
    
    /**
     * Log a failed operation
     */
    public void logFailedOperation(String entityType, String entityId, String action, String error, String userId) {
        AuditEvent event = AuditEvent.builder()
                .timestamp(ZonedDateTime.now())
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .userId(userId)
                .status("FAILED")
                .changeSummary(error)
                .build();
        
        logAuditEvent(event);
    }
}
