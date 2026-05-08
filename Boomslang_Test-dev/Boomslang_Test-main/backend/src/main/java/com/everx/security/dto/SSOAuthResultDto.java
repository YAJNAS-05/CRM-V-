package com.everx.security.dto;

import lombok.AllArgsConstructor;
    import lombok.Builder;
    import lombok.Data;
    import lombok.NoArgsConstructor;

    import java.time.LocalDateTime;
    import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SSOAuthResultDto {
    private boolean success;
    private String userId;
    private String sessionId;
    private UserMapping userMapping;
    private SSOConfigDto.SSOProvider provider;
    private LocalDateTime authenticatedAt;
    private String error;
    private String errorCode;
    private Map<String, Object> additionalInfo;

    @lombok.Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserMapping {
        private String externalId;
        private String email;
        private String name;
        private Map<String, Object> attributes;
        private String role;
        private String department;
        private boolean isActive;
    }
}
