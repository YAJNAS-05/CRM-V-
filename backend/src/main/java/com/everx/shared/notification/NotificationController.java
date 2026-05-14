package com.everx.shared.notification;

import com.everx.shared.dto.ApiResponse;
import com.everx.shared.notification.dto.CreateNotificationRequest;
import com.everx.shared.notification.dto.NotificationDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> listMyNotifications(Authentication authentication) {
        List<NotificationDTO> notifications = notificationService.listForUser(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(notifications, "Notifications retrieved"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NotificationDTO>> createNotification(
            Authentication authentication,
            @Valid @RequestBody CreateNotificationRequest request
    ) {
        NotificationDTO notification = notificationService.createForUser(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(notification, "Notification created"));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead(Authentication authentication) {
        notificationService.markAllRead(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(null, "Notifications marked as read"));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(
            Authentication authentication,
            @PathVariable UUID notificationId
    ) {
        notificationService.markRead(authentication.getName(), notificationId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Notification marked as read"));
    }
}
