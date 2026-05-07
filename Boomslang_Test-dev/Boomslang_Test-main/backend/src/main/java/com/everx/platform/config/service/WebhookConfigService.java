package com.everx.platform.config.service;

import com.everx.platform.config.dto.CreateWebhookSubscriptionRequest;
import com.everx.platform.config.dto.UpdateWebhookSubscriptionRequest;
import com.everx.platform.config.dto.WebhookSubscriptionDto;
import com.everx.platform.config.entity.WebhookSubscription;
import com.everx.platform.config.repository.WebhookSubscriptionRepository;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class WebhookConfigService {

    private final WebhookSubscriptionRepository webhookRepository;

    @Transactional(readOnly = true)
    public List<WebhookSubscriptionDto> listSubscriptions() {
        return webhookRepository.findByIsActiveTrueAndIsDeletedFalse()
                .stream()
                .map(WebhookSubscriptionDto::fromEntity)
                .toList();
    }

    public WebhookSubscriptionDto createSubscription(CreateWebhookSubscriptionRequest request) {
        WebhookSubscription subscription = WebhookSubscription.builder()
                .module(request.getModule())
                .entity(request.getEntity())
                .eventType(request.getEventType())
                .targetUrl(request.getTargetUrl())
                .secret(request.getSecret())
                .headersJson(request.getHeadersJson())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return WebhookSubscriptionDto.fromEntity(webhookRepository.save(subscription));
    }

    public WebhookSubscriptionDto updateSubscription(UUID subscriptionId, UpdateWebhookSubscriptionRequest request) {
        WebhookSubscription subscription = webhookRepository.findById(subscriptionId)
                .orElseThrow(() -> new EntityNotFoundException("Webhook subscription not found"));

        if (request.getEventType() != null) subscription.setEventType(request.getEventType());
        if (request.getTargetUrl() != null) subscription.setTargetUrl(request.getTargetUrl());
        if (request.getSecret() != null) subscription.setSecret(request.getSecret());
        if (request.getHeadersJson() != null) subscription.setHeadersJson(request.getHeadersJson());
        if (request.getIsActive() != null) subscription.setIsActive(request.getIsActive());

        return WebhookSubscriptionDto.fromEntity(webhookRepository.save(subscription));
    }

    public void deleteSubscription(UUID subscriptionId) {
        WebhookSubscription subscription = webhookRepository.findById(subscriptionId)
                .orElseThrow(() -> new EntityNotFoundException("Webhook subscription not found"));
        subscription.softDelete();
        webhookRepository.save(subscription);
    }
}
