package com.everx.websocket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemStatus {
    private String status;
    private String message;
    private LocalDateTime timestamp;
    private Map<String, Object> metrics;
    private String component;
    private String severity;
    private Boolean isHealthy;
    private Double cpuUsage;
    private Double memoryUsage;
    private Long activeUsers;
    private Long activeConnections;
}
