package com.everx.workflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowExecutionDto {
    private UUID id;
    private UUID workflowId;
    private String workflowName;
    private String sourceModule;
    private String targetModule;
    private String status;
    private String result;
    private Instant startedAt;
    private Instant completedAt;
    private String errorMessage;
}
