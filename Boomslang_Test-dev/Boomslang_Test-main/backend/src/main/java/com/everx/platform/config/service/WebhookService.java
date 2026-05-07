package com.everx.platform.config.service;

import com.everx.platform.config.entity.WebhookSubscription;
import com.everx.platform.config.repository.WebhookSubscriptionRepository;
import com.everx.shared.exception.ValidationException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebhookService {

    private final WebhookSubscriptionRepository webhookRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    public void dispatchEvent(String module, String entity, String eventType, Map<String, Object> payload) {
        List<WebhookSubscription> subscriptions = webhookRepository
                .findByModuleAndEntityAndEventTypeAndIsActiveTrueAndIsDeletedFalse(module, entity, eventType);

        if (subscriptions.isEmpty()) {
            return;
        }

        subscriptions.forEach(subscription -> {
            try {
                String body = objectMapper.writeValueAsString(payload);
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.add("X-EverX-Event", eventType);
                if (subscription.getSecret() != null && !subscription.getSecret().isBlank()) {
                    headers.add("X-EverX-Secret", subscription.getSecret());
                }
                if (subscription.getHeadersJson() != null && !subscription.getHeadersJson().isBlank()) {
                    Map<String, String> customHeaders = objectMapper.readValue(subscription.getHeadersJson(), Map.class);
                    customHeaders.forEach(headers::add);
                }

                restTemplate.postForEntity(subscription.getTargetUrl(), new HttpEntity<>(body, headers), String.class);
            } catch (JsonProcessingException ex) {
                log.warn("Failed to serialize webhook payload", ex);
                throw new ValidationException("Webhook payload serialization failed");
            } catch (Exception ex) {
                log.warn("Webhook dispatch failed for {}", subscription.getTargetUrl(), ex);
            }
        });
    }
}
