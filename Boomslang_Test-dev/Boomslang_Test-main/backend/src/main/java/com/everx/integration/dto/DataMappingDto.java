package com.everx.integration.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataMappingDto {
    private UUID id;
    private UUID tenantId;
    private String name;
    private String description;
    private String sourceEntityType;
    private String targetEntityType;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private Long usageCount;
    private Double successRate;
    private Boolean isDefault;
    private String sourceSystem;
    private String targetSystem;
}
