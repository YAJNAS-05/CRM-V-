package com.everx.compliance.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditTrailDto {
    private String id;
    private String userId;
    private String entityType;
    private String entityId;
    private String action;
    private String oldValue;
    private String newValue;
    private LocalDateTime timestamp;
    private String ipAddress;
    private String userAgent;
}
