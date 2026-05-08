package com.everx.websocket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrossModuleEvent {
    private UUID id;
    private String sourceModule;
    private String targetModule;
    private String action;
    private String eventType;
    private UUID entityId;
    private String entityType;
    private Map<String, Object> data;
    private UUID triggeredBy;
    private LocalDateTime timestamp;
    private String priority;
    private String status;
}
