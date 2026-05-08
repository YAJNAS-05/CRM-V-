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
public class IntegrationExecutionDto {
    private UUID id;
    private UUID configId;
    private Status status;
    private String triggeredBy;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Double actualDuration;
    private Long processedRecords;
    private Long successRecords;
    private Long failureRecords;
    private Double successRate;
    private String errorMessage;
    private Integer retryCount;

    public enum Status {
        PENDING,
        RUNNING,
        COMPLETED,
        FAILED,
        CANCELLED,
        TIMEOUT,
        RETRYING
    }
}
