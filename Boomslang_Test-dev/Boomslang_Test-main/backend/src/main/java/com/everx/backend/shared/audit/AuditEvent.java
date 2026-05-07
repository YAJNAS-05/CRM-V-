package com.everx.backend.shared.audit;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.Map;

/**
 * Audit event model for JSON logging
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditEvent {
    
    @JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSZ")
    private ZonedDateTime timestamp;
    
    private String requestId;
    private String correlationId;
    private String userId;
    private String action;
    private String entityType;
    private String entityId;
    private String operationType;
    private Map<String, Object> oldValues;
    private Map<String, Object> newValues;
    private String changeSummary;
    private String ipAddress;
    private String userAgent;
    private String status;
    private String errorCode;
    private String errorMessage;
    private Integer responseTimeMs;
}
