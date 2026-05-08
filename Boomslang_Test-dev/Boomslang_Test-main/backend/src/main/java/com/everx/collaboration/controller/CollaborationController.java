package com.everx.collaboration.controller;

import com.everx.collaboration.dto.*;
import com.everx.collaboration.service.CollaborationService;
import com.everx.collaboration.service.MessageService;
import com.everx.collaboration.service.DocumentService;
import com.everx.collaboration.service.ActivityService;
import com.everx.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/collaboration")
@RequiredArgsConstructor
@Slf4j
public class CollaborationController {

    private final CollaborationService collaborationService;
    private final MessageService messageService;
    private final DocumentService documentService;
    private final ActivityService activityService;

    // Collaboration Sessions
    @GetMapping("/sessions")
    @PreAuthorize("hasAuthority('COLLABORATION_VIEW')")
    public ResponseEntity<ApiResponse<Page<CollaborationSessionDto>>> getSessions(
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/collaboration/sessions");
        Page<CollaborationSessionDto> sessions = collaborationService.getAllSessions(pageable);
        return ResponseEntity.ok(ApiResponse.ok(sessions, "Collaboration sessions retrieved successfully"));
    }

    @GetMapping("/sessions/{sessionId}")
    @PreAuthorize("hasAuthority('COLLABORATION_VIEW')")
    public ResponseEntity<ApiResponse<CollaborationSessionDto>> getSessionById(@PathVariable UUID sessionId) {
        log.info("GET /api/v1/collaboration/sessions/{}", sessionId);
        CollaborationSessionDto session = collaborationService.getSessionById(sessionId);
        return ResponseEntity.ok(ApiResponse.ok(session, "Collaboration session retrieved successfully"));
    }

    @PostMapping("/sessions")
    @PreAuthorize("hasAuthority('COLLABORATION_CREATE')")
    public ResponseEntity<ApiResponse<CollaborationSessionDto>> createSession(@Valid @RequestBody CreateCollaborationSessionRequest request) {
        log.info("POST /api/v1/collaboration/sessions - Creating collaboration session");
        ApiResponse<CollaborationSessionDto> response = collaborationService.createSession(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/sessions/{sessionId}")
    @PreAuthorize("hasAuthority('COLLABORATION_UPDATE')")
    public ResponseEntity<ApiResponse<CollaborationSessionDto>> updateSession(@PathVariable UUID sessionId, @Valid @RequestBody UpdateCollaborationSessionRequest request) {
        log.info("PUT /api/v1/collaboration/sessions/{} - Updating collaboration session", sessionId);
        ApiResponse<CollaborationSessionDto> response = collaborationService.updateSession(sessionId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sessions/{sessionId}/join")
    @PreAuthorize("hasAuthority('COLLABORATION_JOIN')")
    public ResponseEntity<ApiResponse<Void>> joinSession(@PathVariable UUID sessionId) {
        log.info("POST /api/v1/collaboration/sessions/{}/join", sessionId);
        collaborationService.joinSession(sessionId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Joined session successfully"));
    }

    @PostMapping("/sessions/{sessionId}/leave")
    @PreAuthorize("hasAuthority('COLLABORATION_JOIN')")
    public ResponseEntity<ApiResponse<Void>> leaveSession(@PathVariable UUID sessionId) {
        log.info("POST /api/v1/collaboration/sessions/{}/leave", sessionId);
        collaborationService.leaveSession(sessionId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Left session successfully"));
    }

    // Messages
    @GetMapping("/sessions/{sessionId}/messages")
    @PreAuthorize("hasAuthority('COLLABORATION_VIEW')")
    public ResponseEntity<ApiResponse<Page<MessageDto>>> getSessionMessages(
            @PathVariable UUID sessionId,
            @PageableDefault(size = 50, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/collaboration/sessions/{}/messages", sessionId);
        Page<MessageDto> messages = messageService.getSessionMessages(sessionId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(messages, "Messages retrieved successfully"));
    }

    @PostMapping("/sessions/{sessionId}/messages")
    @PreAuthorize("hasAuthority('COLLABORATION_MESSAGE')")
    public ResponseEntity<ApiResponse<MessageDto>> sendMessage(
            @PathVariable UUID sessionId,
            @Valid @RequestBody SendMessageRequest request) {
        log.info("POST /api/v1/collaboration/sessions/{}/messages - Sending message", sessionId);
        ApiResponse<MessageDto> response = messageService.sendMessage(sessionId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/messages/{messageId}")
    @PreAuthorize("hasAuthority('COLLABORATION_MESSAGE')")
    public ResponseEntity<ApiResponse<MessageDto>> updateMessage(@PathVariable UUID messageId, @Valid @RequestBody UpdateMessageRequest request) {
        log.info("PUT /api/v1/collaboration/messages/{} - Updating message", messageId);
        ApiResponse<MessageDto> response = messageService.updateMessage(messageId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/messages/{messageId}")
    @PreAuthorize("hasAuthority('COLLABORATION_MESSAGE')")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(@PathVariable UUID messageId) {
        log.info("DELETE /api/v1/collaboration/messages/{} - Deleting message", messageId);
        messageService.deleteMessage(messageId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Message deleted successfully"));
    }

    // Documents
    @GetMapping("/sessions/{sessionId}/documents")
    @PreAuthorize("hasAuthority('COLLABORATION_VIEW')")
    public ResponseEntity<ApiResponse<Page<DocumentDto>>> getSessionDocuments(
            @PathVariable UUID sessionId,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/collaboration/sessions/{}/documents", sessionId);
        Page<DocumentDto> documents = documentService.getSessionDocuments(sessionId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(documents, "Documents retrieved successfully"));
    }

    @PostMapping("/sessions/{sessionId}/documents")
    @PreAuthorize("hasAuthority('COLLABORATION_DOCUMENT')")
    public ResponseEntity<ApiResponse<DocumentDto>> uploadDocument(
            @PathVariable UUID sessionId,
            @Valid @RequestBody UploadDocumentRequest request) {
        log.info("POST /api/v1/collaboration/sessions/{}/documents - Uploading document", sessionId);
        ApiResponse<DocumentDto> response = documentService.uploadDocument(sessionId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/documents/{documentId}/download")
    @PreAuthorize("hasAuthority('COLLABORATION_VIEW')")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable UUID documentId) {
        log.info("GET /api/v1/collaboration/documents/{}/download", documentId);
        byte[] content = documentService.downloadDocument(documentId);
        return ResponseEntity.ok()
            .header("Content-Type", "application/octet-stream")
            .body(content);
    }

    @DeleteMapping("/documents/{documentId}")
    @PreAuthorize("hasAuthority('COLLABORATION_DOCUMENT')")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable UUID documentId) {
        log.info("DELETE /api/v1/collaboration/documents/{} - Deleting document", documentId);
        documentService.deleteDocument(documentId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Document deleted successfully"));
    }

    // Activities
    @GetMapping("/sessions/{sessionId}/activities")
    @PreAuthorize("hasAuthority('COLLABORATION_VIEW')")
    public ResponseEntity<ApiResponse<Page<ActivityDto>>> getSessionActivities(
            @PathVariable UUID sessionId,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/collaboration/sessions/{}/activities", sessionId);
        Page<ActivityDto> activities = activityService.getSessionActivities(sessionId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(activities, "Activities retrieved successfully"));
    }

    @PostMapping("/sessions/{sessionId}/activities")
    @PreAuthorize("hasAuthority('COLLABORATION_ACTIVITY')")
    public ResponseEntity<ApiResponse<ActivityDto>> createActivity(
            @PathVariable UUID sessionId,
            @Valid @RequestBody CreateActivityRequest request) {
        log.info("POST /api/v1/collaboration/sessions/{}/activities - Creating activity", sessionId);
        ApiResponse<ActivityDto> response = activityService.createActivity(sessionId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Collaboration Users
    @GetMapping("/sessions/{sessionId}/users")
    @PreAuthorize("hasAuthority('COLLABORATION_VIEW')")
    public ResponseEntity<ApiResponse<List<CollaborationUserDto>>> getSessionUsers(@PathVariable UUID sessionId) {
        log.info("GET /api/v1/collaboration/sessions/{}/users", sessionId);
        List<CollaborationUserDto> users = collaborationService.getSessionUsers(sessionId);
        return ResponseEntity.ok(ApiResponse.ok(users, "Session users retrieved successfully"));
    }

    @PostMapping("/sessions/{sessionId}/users/{userId}")
    @PreAuthorize("hasAuthority('COLLABORATION_MANAGE')")
    public ResponseEntity<ApiResponse<Void>> addUserToSession(@PathVariable UUID sessionId, @PathVariable UUID userId) {
        log.info("POST /api/v1/collaboration/sessions/{}/users/{} - Adding user to session", sessionId, userId);
        collaborationService.addUserToSession(sessionId, userId);
        return ResponseEntity.ok(ApiResponse.ok(null, "User added to session successfully"));
    }

    @DeleteMapping("/sessions/{sessionId}/users/{userId}")
    @PreAuthorize("hasAuthority('COLLABORATION_MANAGE')")
    public ResponseEntity<ApiResponse<Void>> removeUserFromSession(@PathVariable UUID sessionId, @PathVariable UUID userId) {
        log.info("DELETE /api/v1/collaboration/sessions/{}/users/{} - Removing user from session", sessionId, userId);
        collaborationService.removeUserFromSession(sessionId, userId);
        return ResponseEntity.ok(ApiResponse.ok(null, "User removed from session successfully"));
    }

    // Analytics and Reporting
    @GetMapping("/sessions/{sessionId}/analytics")
    @PreAuthorize("hasAuthority('COLLABORATION_VIEW')")
    public ResponseEntity<ApiResponse<SessionAnalyticsDto>> getSessionAnalytics(@PathVariable UUID sessionId) {
        log.info("GET /api/v1/collaboration/sessions/{}/analytics", sessionId);
        SessionAnalyticsDto analytics = collaborationService.getSessionAnalytics(sessionId);
        return ResponseEntity.ok(ApiResponse.ok(analytics, "Session analytics retrieved successfully"));
    }

    @GetMapping("/analytics/overview")
    @PreAuthorize("hasAuthority('COLLABORATION_VIEW')")
    public ResponseEntity<ApiResponse<Object>> getCollaborationAnalytics(@RequestParam UUID tenantId) {
        log.info("GET /api/v1/collaboration/analytics/overview - tenantId: {}", tenantId);
        Object analytics = collaborationService.getCollaborationAnalytics(tenantId);
        return ResponseEntity.ok(ApiResponse.ok(analytics, "Collaboration analytics retrieved successfully"));
    }

    // Search and Filtering
    @GetMapping("/search")
    @PreAuthorize("hasAuthority('COLLABORATION_VIEW')")
    public ResponseEntity<ApiResponse<Object>> searchCollaboration(
            @RequestParam String query,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) UUID sessionId,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/collaboration/search - query: {}, type: {}, sessionId: {}", query, type, sessionId);
        Object results = collaborationService.searchCollaboration(query, type, sessionId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(results, "Search results retrieved successfully"));
    }

    // Notifications
    @GetMapping("/notifications")
    @PreAuthorize("hasAuthority('COLLABORATION_VIEW')")
    public ResponseEntity<ApiResponse<Page<CollaborationNotificationDto>>> getNotifications(
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/collaboration/notifications");
        Page<CollaborationNotificationDto> notifications = collaborationService.getNotifications(pageable);
        return ResponseEntity.ok(ApiResponse.ok(notifications, "Notifications retrieved successfully"));
    }

    @PostMapping("/notifications/{notificationId}/read")
    @PreAuthorize("hasAuthority('COLLABORATION_VIEW')")
    public ResponseEntity<ApiResponse<Void>> markNotificationAsRead(@PathVariable UUID notificationId) {
        log.info("POST /api/v1/collaboration/notifications/{}/read", notificationId);
        collaborationService.markNotificationAsRead(notificationId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Notification marked as read"));
    }
}
