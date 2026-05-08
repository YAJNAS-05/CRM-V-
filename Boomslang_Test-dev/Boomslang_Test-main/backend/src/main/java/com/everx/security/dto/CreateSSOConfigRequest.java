package com.everx.security.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSSOConfigRequest {
    private SSOConfigDto.SSOProvider provider;
    private String clientId;
    private String clientSecret;
    private String authorizationUrl;
    private String tokenUrl;
    private String userInfoUrl;
    private Map<String, Object> scopes;
    private Map<String, Object> mapping;
    private String createdBy;
}
