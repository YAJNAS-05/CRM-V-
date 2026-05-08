package com.everx.integration.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecuteIntegrationRequest {
    private UUID configId;
    private Map<String, Object> data;
    private String triggeredBy;
    private String correlationId;
    private String batchId;
    private Map<String, Object> metadata;
    private Integer priority;
    private Integer timeoutMinutes;
    private Boolean forceExecution;
}
