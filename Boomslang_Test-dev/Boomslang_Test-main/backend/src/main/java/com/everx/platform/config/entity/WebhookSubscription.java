package com.everx.platform.config.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "webhook_subscriptions", schema = "everx_shared")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class WebhookSubscription extends BaseEntity {

    @Column(name = "module", nullable = false, length = 50)
    private String module;

    @Column(name = "entity", nullable = false, length = 50)
    private String entity;

    @Column(name = "event_type", nullable = false, length = 80)
    private String eventType;

    @Column(name = "target_url", nullable = false, columnDefinition = "TEXT")
    private String targetUrl;

    @Column(name = "secret", columnDefinition = "TEXT")
    private String secret;

    @Column(name = "headers_json", columnDefinition = "TEXT")
    private String headersJson;

    @Column(name = "is_active", nullable = false)
    @lombok.Builder.Default
    private Boolean isActive = true;
}
