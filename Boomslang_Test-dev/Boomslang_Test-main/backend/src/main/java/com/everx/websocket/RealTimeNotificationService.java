package com.everx.websocket;

import com.everx.websocket.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RealTimeNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    // ==================== User Notifications ====================

    @Async
    public void sendToUser(UUID userId, WebSocketMessage message) {
        try {
            messagingTemplate.convertAndSendToUser(
                userId.toString(), 
                "/queue/notifications", 
                message
            );
            log.debug("Sent notification to user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to send notification to user: {}", userId, e);
        }
    }

    @Async
    public void sendNotification(UUID userId, String type, String title, String message, Object data) {
        WebSocketMessage wsMessage = WebSocketMessage.builder()
            .type(type)
            .title(title)
            .message(message)
            .data(data)
            .timestamp(java.time.Instant.now())
            .build();
        sendToUser(userId, wsMessage);
    }

    // ==================== Module Broadcasts ====================

    @Async
    public void broadcastToModule(String module, WebSocketMessage message) {
        String destination = "/topic/" + module.toLowerCase();
        messagingTemplate.convertAndSend(destination, message);
        log.debug("Broadcast to {}: {}", module, message.getType());
    }

    @Async
    public void broadcastEntityChange(String module, String entityType, String action, Object entity) {
        WebSocketMessage message = WebSocketMessage.builder()
            .type("ENTITY_CHANGE")
            .module(module)
            .entityType(entityType)
            .action(action)
            .data(entity)
            .timestamp(java.time.Instant.now())
            .build();
        broadcastToModule(module, message);
    }

    // ==================== Cross-Module Events ====================

    @Async
    public void publishCrossModuleEvent(CrossModuleEvent event) {
        WebSocketMessage message = WebSocketMessage.builder()
            .type("CROSS_MODULE_EVENT")
            .sourceModule(event.getSourceModule())
            .targetModule(event.getTargetModule())
            .action(event.getAction())
            .data(event)
            .timestamp(java.time.Instant.now())
            .build();

        // Send to target module topic
        String destination = "/topic/" + event.getTargetModule().toLowerCase() + "/events";
        messagingTemplate.convertAndSend(destination, message);
        
        log.info("Published cross-module event from {} to {}: {}", 
            event.getSourceModule(), event.getTargetModule(), event.getAction());
    }

    // ==================== Dashboard Updates ====================

    @Async
    public void broadcastDashboardUpdate(String dashboardType, Object metrics) {
        WebSocketMessage message = WebSocketMessage.builder()
            .type("DASHBOARD_UPDATE")
            .dashboardType(dashboardType)
            .data(metrics)
            .timestamp(java.time.Instant.now())
            .build();

        String destination = "/topic/dashboard/" + dashboardType;
        messagingTemplate.convertAndSend(destination, message);
    }

    // ==================== Alert Broadcasting ====================

    @Async
    public void broadcastAlert(String severity, String title, String message, Object details) {
        WebSocketMessage wsMessage = WebSocketMessage.builder()
            .type("ALERT")
            .severity(severity) // INFO, WARNING, CRITICAL
            .title(title)
            .message(message)
            .data(details)
            .timestamp(java.time.Instant.now())
            .build();

        messagingTemplate.convertAndSend("/topic/alerts", wsMessage);
        log.warn("Broadcast alert [{}]: {} - {}", severity, title, message);
    }

    // ==================== Activity Feed ====================

    @Async
    public void publishActivity(String module, String activityType, String description, UUID actorId, Object context) {
        ActivityFeedItem item = ActivityFeedItem.builder()
            .module(module)
            .activityType(activityType)
            .description(description)
            .actorId(actorId)
            .context(context)
            .timestamp(java.time.Instant.now())
            .build();

        WebSocketMessage message = WebSocketMessage.builder()
            .type("ACTIVITY")
            .data(item)
            .timestamp(java.time.Instant.now())
            .build();

        // Broadcast to module activity feed
        messagingTemplate.convertAndSend("/topic/" + module.toLowerCase() + "/activity", message);
        
        // Also broadcast to global activity feed
        messagingTemplate.convertAndSend("/topic/activity", message);
    }

    // ==================== Workflow Events ====================

    @Async
    public void sendWorkflowNotification(UUID assigneeId, String workflowType, String status, Object workflowData) {
        WebSocketMessage message = WebSocketMessage.builder()
            .type("WORKFLOW_NOTIFICATION")
            .workflowType(workflowType)
            .status(status)
            .data(workflowData)
            .timestamp(java.time.Instant.now())
            .build();

        sendToUser(assigneeId, message);
    }

    // ==================== System Status ====================

    @Async
    public void broadcastSystemStatus(SystemStatus status) {
        WebSocketMessage message = WebSocketMessage.builder()
            .type("SYSTEM_STATUS")
            .data(status)
            .timestamp(java.time.Instant.now())
            .build();

        messagingTemplate.convertAndSend("/topic/system/status", message);
    }

    // ==================== Notification Methods by Feature ====================

    public void notifyLeadScored(UUID userId, Object leadScoreData) {
        sendNotification(userId, "LEAD_SCORED", "Lead Score Updated", 
            "A lead's score has been updated based on recent activity", leadScoreData);
    }

    public void notifyDealStageChange(UUID userId, Object dealData) {
        sendNotification(userId, "DEAL_STAGE_CHANGED", "Deal Stage Updated", 
            "A deal has moved to a new stage", dealData);
    }

    public void notifyInvoicePaid(UUID userId, Object invoiceData) {
        sendNotification(userId, "INVOICE_PAID", "Invoice Paid", 
            "An invoice has been marked as paid", invoiceData);
    }

    public void notifyApprovalRequired(UUID approverId, String module, Object item) {
        sendNotification(approverId, "APPROVAL_REQUIRED", "Approval Required", 
            "A new item in " + module + " requires your approval", item);
    }

    public void notifyDataSyncComplete(UUID userId, String module, Object syncInfo) {
        sendNotification(userId, "SYNC_COMPLETE", "Data Synchronization Complete", 
            module + " data has been synchronized", syncInfo);
    }
}
