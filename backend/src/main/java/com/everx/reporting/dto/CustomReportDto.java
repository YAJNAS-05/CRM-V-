package com.everx.reporting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomReportDto {
    private String id;
    private String name;
    private String description;
    private List<Map<String, Object>> widgets;
    private Integer refreshRate;
    private Map<String, Object> filters;
    private String createdBy;
    private String ownedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
