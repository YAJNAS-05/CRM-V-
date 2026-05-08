package com.everx.workflow.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class WorkflowDto {
    private UUID id;
    private String name;
    private String description;
    private UUID tenantId;
    private UUID createdByUserId;
    private String category;
    private String tags;
    private String triggerType;
    private String triggerConfig;
    private Boolean isActive;
    private Boolean isPublished;
    private Integer version;
    private Long executionCount;
    private Long successCount;
    private Long failureCount;
    private Double successRate;
    private LocalDateTime lastExecutedAt;
    private LocalDateTime nextExecutionAt;
    private Integer timeoutMinutes;
    private Integer retryCount;
    private Integer retryDelayMinutes;
    private String variables;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
