package com.everx.security.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SSOAuthRequest {
    private SSOConfigDto.SSOProvider provider;
    private String authorizationCode;
    private String redirectUri;
    private String state;
    private String ipAddress;
    private String userAgent;
    private String deviceFingerprint;
}
