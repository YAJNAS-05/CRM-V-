package com.everx.platform.config.service;

import com.everx.auth.entity.User;
import com.everx.auth.repository.UserRepository;
import com.everx.platform.config.entity.WorkflowApprovalRequest;
import com.everx.shared.service.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkflowNotificationService {

    private static final String EVENT_APPROVAL_REQUESTED = "workflow.approval.requested";
    private static final String EVENT_APPROVAL_SLA_BREACHED = "workflow.approval.sla_breached";
    private static final String EVENT_APPROVAL_ESCALATED = "workflow.approval.escalated";
    private static final String EVENT_APPROVAL_RESOLVED = "workflow.approval.resolved";

    private final WebhookService webhookService;
    private final MailService mailService;
    private final UserRepository userRepository;

    public void notifyApprovalRequested(WorkflowApprovalRequest approval) {
        dispatchWebhook(EVENT_APPROVAL_REQUESTED, approval);
        notifyRole(approval.getApproverRole(),
                buildSubject("Approval required", approval),
                buildBody("Approval required", approval, null));
    }

    public void notifySlaBreached(WorkflowApprovalRequest approval) {
        dispatchWebhook(EVENT_APPROVAL_SLA_BREACHED, approval);
        notifyRole(approval.getApproverRole(),
                buildSubject("Approval SLA breached", approval),
                buildBody("SLA breached", approval, approval.getSlaBreachedAt()));
    }

    public void notifyApprovalEscalated(WorkflowApprovalRequest approval) {
        dispatchWebhook(EVENT_APPROVAL_ESCALATED, approval);
        String escalationRole = approval.getEscalationRole();
        if (escalationRole == null || escalationRole.isBlank()) {
            escalationRole = approval.getApproverRole();
        }
        notifyRole(escalationRole,
                buildSubject("Approval escalated", approval),
                buildBody("Escalated", approval, approval.getEscalatedAt()));
    }

    public void notifyApprovalResolved(WorkflowApprovalRequest approval) {
        dispatchWebhook(EVENT_APPROVAL_RESOLVED, approval);
        notifyRole(approval.getApproverRole(),
                buildSubject("Approval resolved", approval),
                buildBody("Resolved", approval, approval.getResolvedAt()));
    }

    private void dispatchWebhook(String eventType, WorkflowApprovalRequest approval) {
        Map<String, Object> payload = buildPayload(approval);
        payload.put("eventType", eventType);
        webhookService.dispatchEvent(approval.getModule(), approval.getEntity(), eventType, payload);
    }

    private Map<String, Object> buildPayload(WorkflowApprovalRequest approval) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", approval.getId());
        payload.put("module", approval.getModule());
        payload.put("entity", approval.getEntity());
        payload.put("entityId", approval.getEntityId());
        payload.put("fromStatus", approval.getFromStatus());
        payload.put("toStatus", approval.getToStatus());
        payload.put("status", approval.getStatus());
        payload.put("approverRole", approval.getApproverRole());
        payload.put("escalationRole", approval.getEscalationRole());
        payload.put("escalationAfterHours", approval.getEscalationAfterHours());
        payload.put("requestedBy", approval.getRequestedBy());
        payload.put("approvedBy", approval.getApprovedBy());
        payload.put("dueAt", approval.getDueAt());
        payload.put("slaBreachedAt", approval.getSlaBreachedAt());
        payload.put("escalatedAt", approval.getEscalatedAt());
        payload.put("escalationLevel", approval.getEscalationLevel());
        payload.put("resolvedAt", approval.getResolvedAt());
        payload.put("appliedAt", approval.getAppliedAt());
        return payload;
    }

    private void notifyRole(String roleName, String subject, String body) {
        if (roleName == null || roleName.isBlank()) {
            return;
        }

        Set<String> recipients = new LinkedHashSet<>();
        User.UserRole roleEnum = parseRole(roleName);
        if (roleEnum != null) {
            List<User> users = userRepository.findByRoleAndIsDeletedFalseAndIsActiveTrue(roleEnum);
            users.forEach(user -> recipients.add(user.getEmail()));
        }

        List<User> assignedUsers = userRepository.findByAssignedRoles_NameAndIsDeletedFalseAndIsActiveTrue(roleName);
        assignedUsers.forEach(user -> recipients.add(user.getEmail()));

        if (recipients.isEmpty()) {
            return;
        }

        for (String email : recipients) {
            if (email == null || email.isBlank()) {
                continue;
            }
            mailService.sendSimpleMessage(email, subject, body);
        }
    }

    private User.UserRole parseRole(String roleName) {
        try {
            return User.UserRole.valueOf(roleName.trim().toUpperCase());
        } catch (Exception ex) {
            log.debug("Role {} is not a core role enum", roleName);
            return null;
        }
    }

    private String buildSubject(String action, WorkflowApprovalRequest approval) {
        return String.format("[Workflow] %s: %s/%s %s -> %s",
                action,
                approval.getModule(),
                approval.getEntity(),
                approval.getFromStatus(),
                approval.getToStatus());
    }

    private String buildBody(String action, WorkflowApprovalRequest approval, OffsetDateTime timestamp) {
        StringBuilder body = new StringBuilder();
        body.append(action).append(" for workflow transition.\n");
        body.append("Module: ").append(approval.getModule()).append("\n");
        body.append("Entity: ").append(approval.getEntity()).append("\n");
        body.append("Entity ID: ").append(approval.getEntityId()).append("\n");
        body.append("Transition: ").append(approval.getFromStatus()).append(" -> ").append(approval.getToStatus()).append("\n");
        if (approval.getDueAt() != null) {
            body.append("Due At: ").append(approval.getDueAt()).append("\n");
        }
        if (timestamp != null) {
            body.append("Timestamp: ").append(timestamp).append("\n");
        }
        if (approval.getEscalationRole() != null && !approval.getEscalationRole().isBlank()) {
            body.append("Escalation Role: ").append(approval.getEscalationRole()).append("\n");
        }
        if (approval.getEscalationAfterHours() != null) {
            body.append("Escalation After (hours): ").append(approval.getEscalationAfterHours()).append("\n");
        }
        if (approval.getNotes() != null && !approval.getNotes().isBlank()) {
            body.append("Notes: ").append(approval.getNotes()).append("\n");
        }
        return body.toString();
    }
}
