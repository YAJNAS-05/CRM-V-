package com.everx.compliance.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePolicyRequest {
    private String frameworkId;
    private String code;
    private String name;
    private String description;
    private boolean mandatory;
}
