package com.everx.shared.notification;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.OffsetDateTime;

@Entity
@Table(
    name = "notifications",
    schema = "everx_shared",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_notifications_recipient_dedupe_active",
            columnNames = {"recipient_email", "dedupe_key", "is_deleted"}
        )
    },
    indexes = {
        @Index(name = "idx_notifications_recipient_created", columnList = "recipient_email, is_deleted, created_at"),
        @Index(name = "idx_notifications_recipient_read", columnList = "recipient_email, is_deleted, is_read")
    }
)
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class NotificationEntity extends BaseEntity {

    @Column(name = "recipient_email", nullable = false)
    private String recipientEmail;

    @Column(name = "type", nullable = false, length = 40)
    private String type;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "dedupe_key", length = 200)
    private String dedupeKey;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead;

    @Column(name = "read_at")
    private OffsetDateTime readAt;
}
