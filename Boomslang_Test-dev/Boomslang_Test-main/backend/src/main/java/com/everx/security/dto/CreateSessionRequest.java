package com.everx.security.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSessionRequest {
    private String ipAddress;
    private String userAgent;
    private String deviceFingerprint;
    private String location;
    private String deviceType;
    private String browser;
    private String os;
    private SecuritySessionDto.SessionType sessionType;
    private String loginMethod;
    private boolean mfaRequired;
}
