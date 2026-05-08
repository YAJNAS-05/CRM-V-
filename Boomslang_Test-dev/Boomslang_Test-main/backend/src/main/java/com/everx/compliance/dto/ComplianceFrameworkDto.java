package com.everx.compliance.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceFrameworkDto {
    private String id;
    private String code;
    private String name;
    private String description;
    private String category;
    private String status;
    private boolean mandatory;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<CompliancePolicyDto> policies;
}
