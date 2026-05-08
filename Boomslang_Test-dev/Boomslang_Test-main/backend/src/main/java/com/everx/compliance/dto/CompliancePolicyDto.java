package com.everx.compliance.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompliancePolicyDto {
    private String id;
    private String frameworkId;
    private String code;
    private String name;
    private String description;
    private String status;
    private boolean mandatory;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
