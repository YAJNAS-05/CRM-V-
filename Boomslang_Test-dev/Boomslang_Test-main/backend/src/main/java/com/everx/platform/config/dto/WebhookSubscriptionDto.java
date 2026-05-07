package com.everx.platform.config.dto;

import com.everx.platform.config.entity.WebhookSubscription;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WebhookSubscriptionDto {

    private UUID id;
    private String module;
    private String entity;
    private String eventType;
    private String targetUrl;
    private String secret;
    private String headersJson;
    private Boolean isActive;

    public static WebhookSubscriptionDto fromEntity(WebhookSubscription subscription) {
        return WebhookSubscriptionDto.builder()
                .id(subscription.getId())
                .module(subscription.getModule())
                .entity(subscription.getEntity())
                .eventType(subscription.getEventType())
                .targetUrl(subscription.getTargetUrl())
                .secret(subscription.getSecret())
                .headersJson(subscription.getHeadersJson())
                .isActive(subscription.getIsActive())
                .build();
    }
}
