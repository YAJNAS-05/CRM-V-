package com.everx.platform.config.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateWebhookSubscriptionRequest {

    private String eventType;
    private String targetUrl;
    private String secret;
    private String headersJson;
    private Boolean isActive;
}
