package com.everx.security.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyTwoFactorRequest {
    private String userId;
    private String code;
    private boolean trustDevice;
    private int trustDays;
}
