package com.everx.platform.config.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateWebhookSubscriptionRequest {

    @NotBlank(message = "Module is required")
    private String module;

    @NotBlank(message = "Entity is required")
    private String entity;

    @NotBlank(message = "Event type is required")
    private String eventType;

    @NotBlank(message = "Target URL is required")
    private String targetUrl;

    private String secret;
    private String headersJson;
    private Boolean isActive;
}
