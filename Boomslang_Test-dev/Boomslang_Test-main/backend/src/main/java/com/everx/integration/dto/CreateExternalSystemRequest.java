package com.everx.integration.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateExternalSystemRequest {
    private String name;
    private String description;
    private ExternalSystemDto.SystemType systemType;
    private String baseUrl;
    private String apiVersion;
    private ExternalSystemDto.AuthenticationType authenticationType;
    private String credentials;
    private Map<String, Object> connectionDetails;
    private Integer rateLimitPerHour;
    private Integer timeoutSeconds;
    private Integer retryAttempts;
    private Boolean isMonitored;
    private String environment;
    private String owner;
    private String supportContact;
    private String createdBy;
}
