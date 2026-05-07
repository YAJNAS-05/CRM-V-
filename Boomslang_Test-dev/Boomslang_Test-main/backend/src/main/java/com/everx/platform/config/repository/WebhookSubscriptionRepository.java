package com.everx.platform.config.repository;

import com.everx.platform.config.entity.WebhookSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WebhookSubscriptionRepository extends JpaRepository<WebhookSubscription, UUID> {

    List<WebhookSubscription> findByModuleAndEntityAndEventTypeAndIsActiveTrueAndIsDeletedFalse(
            String module, String entity, String eventType);

    List<WebhookSubscription> findByIsActiveTrueAndIsDeletedFalse();
}
