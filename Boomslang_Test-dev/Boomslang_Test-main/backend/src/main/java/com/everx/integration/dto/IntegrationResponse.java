package com.everx.integration.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntegrationResponse {
    private UUID id;
    private String integrationName;
    private String integrationType;
    private String status;
    private Boolean isActive;
}
