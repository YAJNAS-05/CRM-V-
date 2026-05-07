package com.everx.crm.webhook;

import com.everx.platform.config.service.WebhookService;
import com.everx.shared.util.SecurityUserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CrmWebhookPublisher {

    private static final String MODULE_CRM = "CRM";

    private final WebhookService webhookService;

    public void publish(String entity, String eventType, UUID entityId, Object data) {
        publish(entity, eventType, entityId, data, null);
    }

    public void publish(String entity, String eventType, UUID entityId, Object data, Map<String, Object> extras) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", entityId);
        payload.put("module", MODULE_CRM);
        payload.put("entity", entity);
        payload.put("eventType", eventType);
        payload.put("timestamp", OffsetDateTime.now().toString());
        payload.put("actorId", SecurityUserContext.getCurrentUserIdOrNull());
        if (data != null) {
            payload.put("data", data);
        }
        if (extras != null && !extras.isEmpty()) {
            payload.putAll(extras);
        }

        webhookService.dispatchEvent(MODULE_CRM, entity, eventType, payload);
    }
}
