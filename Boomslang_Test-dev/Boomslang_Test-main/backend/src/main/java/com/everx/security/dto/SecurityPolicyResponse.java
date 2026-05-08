package com.everx.security.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityPolicyResponse {
    private UUID id;
    private String policyName;
    private String policyType;
    private Boolean isEnabled;
}
