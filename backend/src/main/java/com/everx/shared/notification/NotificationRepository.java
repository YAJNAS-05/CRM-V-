package com.everx.shared.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<NotificationEntity, UUID> {
    List<NotificationEntity> findTop100ByRecipientEmailAndIsDeletedFalseOrderByCreatedAtDesc(String recipientEmail);

    Optional<NotificationEntity> findFirstByRecipientEmailAndDedupeKeyAndIsDeletedFalseOrderByCreatedAtDesc(
            String recipientEmail,
            String dedupeKey
    );

        @Modifying(clearAutomatically = true, flushAutomatically = true)
        @Query("""
            update NotificationEntity n
            set n.isRead = true, n.readAt = :readAt
            where n.recipientEmail = :recipientEmail
              and n.isDeleted = false
              and n.isRead = false
            """)
        int markAllReadByRecipientEmail(
            @Param("recipientEmail") String recipientEmail,
            @Param("readAt") OffsetDateTime readAt
        );
}
