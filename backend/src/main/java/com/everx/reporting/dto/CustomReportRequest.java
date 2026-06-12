package com.everx.reporting.dto;

import jakarta.validation.constraints.NotBlank;
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
public class CustomReportRequest {
    @NotBlank
    private String name;
    private String description;
    private List<Map<String, Object>> widgets;
    private Integer refreshRate;
    private Map<String, Object> filters;
}
