package com.everx.workflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateWorkflowRequest {
    private String name;
    private String description;
    private String sourceModule;
    private String targetModule;
    private String triggerEntity;
    private String triggerAction; // CREATED, UPDATED, STATUS_CHANGED, DELETED
    private String targetEntityType;
    private String actionType; // CREATE_ENTITY, UPDATE_ENTITY, NOTIFY, WEBHOOK
    private String actionConfig; // JSON
    private String conditions; // JSON conditions
}
