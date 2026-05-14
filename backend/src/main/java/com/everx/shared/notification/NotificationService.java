package com.everx.shared.notification;

import com.everx.shared.notification.dto.CreateNotificationRequest;
import com.everx.shared.notification.dto.NotificationDTO;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<NotificationDTO> listForUser(String userEmail) {
        return notificationRepository.findTop100ByRecipientEmailAndIsDeletedFalseOrderByCreatedAtDesc(userEmail).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public NotificationDTO createForUser(String userEmail, CreateNotificationRequest request) {
        if (request.getDedupeKey() != null && !request.getDedupeKey().isBlank()) {
            return notificationRepository
                    .findFirstByRecipientEmailAndDedupeKeyAndIsDeletedFalseOrderByCreatedAtDesc(userEmail, request.getDedupeKey())
                    .map(this::toDto)
                    .orElseGet(() -> createNotification(userEmail, request));
        }

        return createNotification(userEmail, request);
    }

    @Transactional
    public void markAllRead(String userEmail) {
        notificationRepository.markAllReadByRecipientEmail(userEmail, OffsetDateTime.now());
    }

    @Transactional
    public void markRead(String userEmail, UUID notificationId) {
        NotificationEntity notification = notificationRepository.findById(notificationId)
                .filter(entity -> !Boolean.TRUE.equals(entity.getIsDeleted()))
                .filter(entity -> userEmail.equalsIgnoreCase(entity.getRecipientEmail()))
            .orElseThrow(() -> new EntityNotFoundException("Notification not found with id: " + notificationId));

        if (!Boolean.TRUE.equals(notification.getIsRead())) {
            notification.setIsRead(true);
            notification.setReadAt(OffsetDateTime.now());
            notificationRepository.save(notification);
        }
    }

    private NotificationDTO createNotification(String userEmail, CreateNotificationRequest request) {
        NotificationEntity entity = NotificationEntity.builder()
                .recipientEmail(userEmail)
                .type(request.getType().toLowerCase())
                .title(request.getTitle())
                .message(request.getMessage())
                .dedupeKey(request.getDedupeKey())
                .isRead(false)
                .build();

        return toDto(notificationRepository.save(entity));
    }

    private NotificationDTO toDto(NotificationEntity entity) {
        return NotificationDTO.builder()
                .id(entity.getId())
                .type(entity.getType())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .dedupeKey(entity.getDedupeKey())
                .isRead(entity.getIsRead())
                .timestamp(entity.getCreatedAt())
                .build();
    }
}
