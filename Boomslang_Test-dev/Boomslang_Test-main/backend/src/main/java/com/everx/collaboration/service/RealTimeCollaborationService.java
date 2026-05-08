package com.everx.collaboration.service;

import com.everx.collaboration.dto.*;
import com.everx.collaboration.entity.*;
import com.everx.collaboration.repository.*;
import com.everx.tenant.service.TenantContextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RealTimeCollaborationService {

    private final CollaborationSessionRepository sessionRepository;
    private final CollaborationUserRepository userRepository;
    private final MessageRepository messageRepository;
    private final DocumentRepository documentRepository;
    private final ActivityRepository activityRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final TenantContextService tenantContextService;

    // In-memory session tracking
    private final Map<String, Set<String>> activeSessions = new ConcurrentHashMap<>();
    private final Map<String, Map<String, UserCursor>> userCursors = new ConcurrentHashMap<>();
    private final Map<String, Map<String, UserSelection>> userSelections = new ConcurrentHashMap<>();

    // Session Management
    @Transactional
    public CollaborationSessionDto createSession(UUID tenantId, CreateSessionRequest request) {
        log.info("Creating collaboration session: {} for tenant: {}", request.getName(), tenantId);

        CollaborationSession session = CollaborationSession.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .name(request.getName())
                .description(request.getDescription())
                .type(request.getType())
                .entityType(request.getEntityType())
                .entityId(request.getEntityId())
                .status(CollaborationSession.Status.ACTIVE)
                .createdBy(request.getCreatedBy())
                .createdAt(LocalDateTime.now())
                .settings(request.getSettings())
                .permissions(request.getPermissions())
                .build();

        session = sessionRepository.save(session);

        // Initialize session tracking
        activeSessions.put(session.getId().toString(), new HashSet<>());

        return convertToDto(session);
    }

    @Transactional
    public CollaborationSessionDto joinSession(UUID sessionId, String userId, JoinSessionRequest request) {
        log.info("User {} joining collaboration session: {}", userId, sessionId);

        CollaborationSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        // Check if user has permission to join
        if (!hasJoinPermission(session, userId, request)) {
            throw new RuntimeException("No permission to join session");
        }

        // Create or update user
        CollaborationUser user = userRepository.findBySessionIdAndUserId(sessionId, userId)
                .orElse(CollaborationUser.builder()
                        .id(UUID.randomUUID())
                        .sessionId(sessionId)
                        .userId(userId)
                        .status(CollaborationUser.Status.ONLINE)
                        .joinedAt(LocalDateTime.now())
                        .lastSeen(LocalDateTime.now())
                        .build());

        user.setDisplayName(request.getDisplayName());
        user.setAvatar(request.getAvatar());
        user.setRole(request.getRole());
        user.setPermissions(request.getPermissions());
        user.setStatus(CollaborationUser.Status.ONLINE);
        user.setLastSeen(LocalDateTime.now());

        user = userRepository.save(user);

        // Track active user
        activeSessions.computeIfAbsent(sessionId.toString(), k -> new HashSet<>()).add(userId);

        // Broadcast user joined
        broadcastSessionEvent(sessionId, "USER_JOINED", Map.of(
                "userId", userId,
                "displayName", user.getDisplayName(),
                "avatar", user.getAvatar(),
                "role", user.getRole()
        ));

        return convertToDto(session);
    }

    @Transactional
    public void leaveSession(UUID sessionId, String userId) {
        log.info("User {} leaving collaboration session: {}", userId, sessionId);

        CollaborationUser user = userRepository.findBySessionIdAndUserId(sessionId, userId)
                .orElse(null);

        if (user != null) {
            user.setStatus(CollaborationUser.Status.OFFLINE);
            user.setLeftAt(LocalDateTime.now());
            userRepository.save(user);
        }

        // Remove from active tracking
        Set<String> sessionUsers = activeSessions.get(sessionId.toString());
        if (sessionUsers != null) {
            sessionUsers.remove(userId);
            if (sessionUsers.isEmpty()) {
                activeSessions.remove(sessionId.toString());
            }
        }

        // Remove cursor and selection
        Map<String, String> cursorMap = userCursors.get(sessionId.toString());
        if (cursorMap != null) {
            cursorMap.remove(userId);
        }
        Map<String, String> selectionMap = userSelections.get(sessionId.toString());
        if (selectionMap != null) {
            selectionMap.remove(userId);
        }

        // Broadcast user left
        broadcastSessionEvent(sessionId, "USER_LEFT", Map.of("userId", userId));
    }

    // Real-time Messaging
    @Async
    @Transactional
    public MessageDto sendMessage(UUID sessionId, String userId, SendMessageRequest request) {
        log.info("Sending message in session: {} from user: {}", sessionId, userId);

        CollaborationSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        // Check permissions
        if (!hasMessagePermission(session, userId, request.getType())) {
            throw new RuntimeException("No permission to send message");
        }

        Message message = Message.builder()
                .id(UUID.randomUUID())
                .sessionId(sessionId)
                .senderId(userId)
                .type(request.getType())
                .content(request.getContent())
                .metadata(request.getMetadata())
                .createdAt(LocalDateTime.now())
                .build();

        message = messageRepository.save(message);

        // Create activity
        createActivity(sessionId, userId, "MESSAGE_SENT", Map.of(
                "messageId", message.getId(),
                "type", message.getType()
        ));

        // Broadcast message
        MessageDto messageDto = convertToDto(message);
        messagingTemplate.convertAndSend("/topic/session/" + sessionId + "/messages", messageDto);

        return messageDto;
    }

    // Real-time Document Collaboration
    @Async
    @Transactional
    public DocumentOperationDto applyDocumentOperation(UUID sessionId, String userId, DocumentOperationRequest request) {
        log.info("Applying document operation in session: {} from user: {}", sessionId, userId);

        CollaborationSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        // Get or create document
        Document document = documentRepository.findBySessionIdAndDocumentId(sessionId, request.getDocumentId())
                .orElse(Document.builder()
                        .id(UUID.randomUUID())
                        .sessionId(sessionId)
                        .documentId(request.getDocumentId())
                        .content("{}")
                        .version(0L)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build());

        // Apply operation
        DocumentOperation operation = DocumentOperation.builder()
                .id(UUID.randomUUID())
                .documentId(document.getId())
                .userId(userId)
                .type(request.getType())
                .position(request.getPosition())
                .content(request.getContent())
                .length(request.getLength())
                .attributes(request.getAttributes())
                .timestamp(LocalDateTime.now())
                .build();

        // Update document content (simplified)
        document.setVersion(document.getVersion() + 1);
        document.setUpdatedAt(LocalDateTime.now());
        document = documentRepository.save(document);

        // Broadcast operation
        DocumentOperationDto operationDto = convertToDto(operation);
        messagingTemplate.convertAndSend("/topic/session/" + sessionId + "/documents/" + request.getDocumentId() + "/operations", operationDto);

        return operationDto;
    }

    // Cursor and Selection Tracking
    @Async
    public void updateCursor(UUID sessionId, String userId, CursorUpdateRequest request) {
        log.debug("Updating cursor for user {} in session: {}", userId, sessionId);

        UserCursor cursor = UserCursor.builder()
                .userId(userId)
                .documentId(request.getDocumentId())
                .position(request.getPosition())
                .selection(request.getSelection())
                .timestamp(LocalDateTime.now())
                .build();

        userCursors.computeIfAbsent(sessionId.toString(), k -> new ConcurrentHashMap<>()).put(userId, cursor);

        // Broadcast cursor update
        messagingTemplate.convertAndSend("/topic/session/" + sessionId + "/cursors", Map.of(
                "userId", userId,
                "cursor", cursor
        ));
    }

    @Async
    public void updateSelection(UUID sessionId, String userId, SelectionUpdateRequest request) {
        log.debug("Updating selection for user {} in session: {}", userId, sessionId);

        UserSelection selection = UserSelection.builder()
                .userId(userId)
                .documentId(request.getDocumentId())
                .range(request.getRange())
                .timestamp(LocalDateTime.now())
                .build();

        userSelections.computeIfAbsent(sessionId.toString(), k -> new ConcurrentHashMap<>()).put(userId, selection);

        // Broadcast selection update
        messagingTemplate.convertAndSend("/topic/session/" + sessionId + "/selections", Map.of(
                "userId", userId,
                "selection", selection
        ));
    }

    // Activity Tracking
    @Transactional
    public void createActivity(UUID sessionId, String userId, String type, Map<String, Object> data) {
        Activity activity = Activity.builder()
                .id(UUID.randomUUID())
                .sessionId(sessionId)
                .userId(userId)
                .type(type)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();

        activityRepository.save(activity);

        // Broadcast activity
        messagingTemplate.convertAndSend("/topic/session/" + sessionId + "/activities", convertToDto(activity));
    }

    // Session Analytics
    @Transactional(readOnly = true)
    public SessionAnalyticsDto getSessionAnalytics(UUID sessionId) {
        log.info("Getting analytics for session: {}", sessionId);

        CollaborationSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        // Get active users
        Set<String> activeUserIds = activeSessions.getOrDefault(sessionId.toString(), Collections.emptySet());
        List<CollaborationUser> activeUsers = userRepository.findBySessionIdAndUserIdIn(sessionId, activeUserIds);

        // Get message statistics
        long messageCount = messageRepository.countBySessionId(sessionId);
        long todayMessageCount = messageRepository.countBySessionIdAndCreatedAtAfter(
                sessionId, LocalDateTime.now().toLocalDate().atStartOfDay());

        // Get document statistics
        long documentCount = documentRepository.countBySessionId(sessionId);
        long operationCount = 0; // Would need operation repository

        return SessionAnalyticsDto.builder()
                .sessionId(sessionId)
                .sessionName(session.getName())
                .activeUserCount(activeUsers.size())
                .totalUserCount(userRepository.countBySessionId(sessionId))
                .messageCount(messageCount)
                .todayMessageCount(todayMessageCount)
                .documentCount(documentCount)
                .operationCount(operationCount)
                .averageResponseTime(calculateAverageResponseTime(sessionId))
                .peakActivityTime(getPeakActivityTime(sessionId))
                .mostActiveUsers(getMostActiveUsers(sessionId))
                .generatedAt(LocalDateTime.now())
                .build();
    }

    // Scheduled Tasks
    @Scheduled(fixedRate = 30000) // Every 30 seconds
    @Transactional
    public void cleanupInactiveUsers() {
        log.debug("Cleaning up inactive users");

        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
        List<CollaborationUser> inactiveUsers = userRepository.findByLastSeenBeforeAndStatus(fiveMinutesAgo, CollaborationUser.Status.ONLINE);

        for (CollaborationUser user : inactiveUsers) {
            user.setStatus(CollaborationUser.Status.AWAY);
            userRepository.save(user);

            // Remove from active tracking
            Set<String> sessionUsers = activeSessions.get(user.getSessionId().toString());
            if (sessionUsers != null) {
                sessionUsers.remove(user.getUserId());
            }

            // Broadcast status change
            broadcastSessionEvent(user.getSessionId(), "USER_STATUS_CHANGED", Map.of(
                    "userId", user.getUserId(),
                    "status", "AWAY"
            ));
        }
    }

    @Scheduled(fixedRate = 300000) // Every 5 minutes
    @Transactional
    public void archiveInactiveSessions() {
        log.debug("Archiving inactive sessions");

        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        List<CollaborationSession> inactiveSessions = sessionRepository.findByStatusAndLastActivityBefore(
                CollaborationSession.Status.ACTIVE, oneHourAgo);

        for (CollaborationSession session : inactiveSessions) {
            session.setStatus(CollaborationSession.Status.ARCHIVED);
            session.setArchivedAt(LocalDateTime.now());
            sessionRepository.save(session);

            // Clean up tracking
            activeSessions.remove(session.getId().toString());
        }
    }

    // Private helper methods
    private boolean hasJoinPermission(CollaborationSession session, String userId, JoinSessionRequest request) {
        // Simplified permission check
        return session.getStatus() == CollaborationSession.Status.ACTIVE;
    }

    private boolean hasMessagePermission(CollaborationSession session, String userId, String messageType) {
        // Simplified permission check
        return session.getStatus() == CollaborationSession.Status.ACTIVE;
    }

    private void broadcastSessionEvent(UUID sessionId, String eventType, Map<String, Object> data) {
        Map<String, Object> event = new HashMap<>(data);
        event.put("type", eventType);
        event.put("timestamp", LocalDateTime.now());

        messagingTemplate.convertAndSend("/topic/session/" + sessionId + "/events", event);
    }

    private Double calculateAverageResponseTime(UUID sessionId) {
        // Simplified calculation
        return 150.0; // milliseconds
    }

    private String getPeakActivityTime(UUID sessionId) {
        // Simplified peak time
        return "14:00-16:00";
    }

    private List<Map<String, Object>> getMostActiveUsers(UUID sessionId) {
        // Simplified most active users
        return List.of(
                Map.of("userId", "user1", "messageCount", 25, "activityScore", 0.8),
                Map.of("userId", "user2", "messageCount", 18, "activityScore", 0.6)
        );
    }

    // DTO conversion methods
    private CollaborationSessionDto convertToDto(CollaborationSession session) {
        return CollaborationSessionDto.builder()
                .id(session.getId())
                .tenantId(session.getTenantId())
                .name(session.getName())
                .description(session.getDescription())
                .type(session.getType())
                .entityType(session.getEntityType())
                .entityId(session.getEntityId())
                .status(session.getStatus())
                .createdBy(session.getCreatedBy())
                .createdAt(session.getCreatedAt())
                .settings(session.getSettings())
                .permissions(session.getPermissions())
                .build();
    }

    private MessageDto convertToDto(Message message) {
        return MessageDto.builder()
                .id(message.getId())
                .sessionId(message.getSessionId())
                .senderId(message.getSenderId())
                .type(message.getType())
                .content(message.getContent())
                .metadata(message.getMetadata())
                .createdAt(message.getCreatedAt())
                .build();
    }

    private DocumentOperationDto convertToDto(DocumentOperation operation) {
        return DocumentOperationDto.builder()
                .id(operation.getId())
                .documentId(operation.getDocumentId())
                .userId(operation.getUserId())
                .type(operation.getType())
                .position(operation.getPosition())
                .content(operation.getContent())
                .length(operation.getLength())
                .attributes(operation.getAttributes())
                .timestamp(operation.getTimestamp())
                .build();
    }

    private ActivityDto convertToDto(Activity activity) {
        return ActivityDto.builder()
                .id(activity.getId())
                .sessionId(activity.getSessionId())
                .userId(activity.getUserId())
                .type(activity.getType())
                .data(activity.getData())
                .timestamp(activity.getTimestamp())
                .build();
    }

    // Inner classes for tracking
    @lombok.Data
    @lombok.Builder
    private static class UserCursor {
        private String userId;
        private String documentId;
        private Integer position;
        private String selection;
        private LocalDateTime timestamp;
    }

    @lombok.Data
    @lombok.Builder
    private static class UserSelection {
        private String userId;
        private String documentId;
        private String range;
        private LocalDateTime timestamp;
    }
}
