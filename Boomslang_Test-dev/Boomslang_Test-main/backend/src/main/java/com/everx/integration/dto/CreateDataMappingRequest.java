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
public class CreateDataMappingRequest {
    private String name;
    private String description;
    private String sourceEntityType;
    private String targetEntityType;
    private List<Map<String, Object>> fieldMappings;
    private Map<String, Object> transformationLogic;
    private List<Map<String, Object>> validationRules;
    private String sourceSystem;
    private String targetSystem;
    private Integer priority;
    private Boolean isDefault;
    private String createdBy;
}
