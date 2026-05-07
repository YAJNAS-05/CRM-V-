package com.everx.platform.config.scheduler;

import com.everx.platform.config.entity.WorkflowApprovalRequest;
import com.everx.platform.config.repository.WorkflowApprovalRequestRepository;
import com.everx.platform.config.service.WorkflowNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class WorkflowApprovalSlaScheduler {

    private final WorkflowApprovalRequestRepository approvalRepository;
    private final WorkflowNotificationService notificationService;

    @Scheduled(fixedDelayString = "${everx.workflow.sla.scan-ms:300000}")
    @SchedulerLock(name = "workflowApprovalSlaScan", lockAtMostFor = "10m", lockAtLeastFor = "1m")
    @Transactional
    public void scanApprovals() {
        OffsetDateTime now = OffsetDateTime.now();
        List<WorkflowApprovalRequest> approvals = approvalRepository
                .findByStatusAndDueAtBeforeAndIsDeletedFalse("PENDING", now);

        if (approvals.isEmpty()) {
            return;
        }

        for (WorkflowApprovalRequest approval : approvals) {
            boolean updated = false;

            if (approval.getSlaBreachedAt() == null) {
                approval.setSlaBreachedAt(now);
                updated = true;
                notificationService.notifySlaBreached(approval);
            }

            String escalationRole = approval.getEscalationRole();
            Integer escalationAfterHours = approval.getEscalationAfterHours();
            if (escalationRole != null && !escalationRole.isBlank() && approval.getEscalatedAt() == null) {
                OffsetDateTime escalationDue = approval.getDueAt();
                if (escalationDue != null && escalationAfterHours != null) {
                    escalationDue = escalationDue.plusHours(escalationAfterHours);
                }

                if (escalationDue != null && !now.isBefore(escalationDue)) {
                    approval.setEscalatedAt(now);
                    Integer currentLevel = approval.getEscalationLevel() != null ? approval.getEscalationLevel() : 0;
                    approval.setEscalationLevel(currentLevel + 1);
                    updated = true;
                    notificationService.notifyApprovalEscalated(approval);
                }
            }

            if (updated) {
                approvalRepository.save(approval);
                log.info("Workflow approval {} updated for SLA/escalation", approval.getId());
            }
        }
    }
}
