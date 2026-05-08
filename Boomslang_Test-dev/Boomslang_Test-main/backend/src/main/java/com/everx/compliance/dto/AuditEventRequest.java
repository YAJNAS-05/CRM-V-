package com.everx.compliance.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditEventRequest {
    private String userId;
    private String entityType;
    private String entityId;
    private String action;
    private String oldValue;
    private String newValue;
    private String ipAddress;
    private String userAgent;
}
