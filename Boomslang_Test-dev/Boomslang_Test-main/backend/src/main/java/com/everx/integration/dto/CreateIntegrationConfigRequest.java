package com.everx.integration.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateIntegrationConfigRequest {
    private String name;
    private String description;
    private IntegrationConfigDto.IntegrationType integrationType;
    private String sourceSystem;
    private String targetSystem;
    private Map<String, Object> connectionDetails;
    private IntegrationConfigDto.AuthenticationType authenticationType;
    private String credentials;
    private String syncFrequency;
    private List<Map<String, Object>> dataMappings;
    private List<Map<String, Object>> transformationRules;
    private Map<String, Object> errorHandling;
    private String retryPolicy;
    private Integer priority;
    private Integer timeoutMinutes;
    private String createdBy;
}
