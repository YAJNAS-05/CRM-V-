package com.everx.security.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnableTwoFactorRequest {
    private String userId;
    private TwoFactorAuthDto.TwoFactorMethod method;
    private String deviceName;
    private boolean trustDevice;
    private int trustDays;
}
