package com.everx.platform.config.service;

import com.everx.platform.config.entity.OptionSet;
import com.everx.platform.config.entity.OptionValue;
import com.everx.platform.config.entity.WorkflowDefinition;
import com.everx.platform.config.entity.WorkflowTransition;
import com.everx.platform.config.repository.OptionSetRepository;
import com.everx.platform.config.repository.OptionValueRepository;
import com.everx.platform.config.repository.WorkflowDefinitionRepository;
import com.everx.platform.config.repository.WorkflowTransitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ConfigSeeder {

    private final OptionSetRepository optionSetRepository;
    private final OptionValueRepository optionValueRepository;
    private final WorkflowDefinitionRepository workflowDefinitionRepository;
    private final WorkflowTransitionRepository workflowTransitionRepository;

    @PostConstruct
    public void seedDefaults() {
        seedPicklists();
        seedWorkflows();
    }

    private void seedPicklists() {
        OptionSet dealStage = ensureOptionSet("CRM", "DEAL", "stage", "Deal Stage");
        ensureOptionValue(dealStage, "PROSPECTING", "Prospecting", 1, "#CBD5F5");
        ensureOptionValue(dealStage, "QUALIFICATION", "Qualification", 2, "#93C5FD");
        ensureOptionValue(dealStage, "PROPOSAL", "Proposal", 3, "#FDE68A");
        ensureOptionValue(dealStage, "NEGOTIATION", "Negotiation", 4, "#FDBA74");
        ensureOptionValue(dealStage, "CLOSED_WON", "Closed Won", 5, "#86EFAC");
        ensureOptionValue(dealStage, "CLOSED_LOST", "Closed Lost", 6, "#FCA5A5");

        OptionSet leadSource = ensureOptionSet("CRM", "DEAL", "leadSource", "Deal Lead Source");
        ensureOptionValue(leadSource, "WEB", "Web", 1, null);
        ensureOptionValue(leadSource, "REFERRAL", "Referral", 2, null);
        ensureOptionValue(leadSource, "COLD_CALL", "Cold Call", 3, null);
        ensureOptionValue(leadSource, "EMAIL_CAMPAIGN", "Email Campaign", 4, null);
        ensureOptionValue(leadSource, "SOCIAL_MEDIA", "Social Media", 5, null);
        ensureOptionValue(leadSource, "OTHER", "Other", 6, null);

        OptionSet leadStatus = ensureOptionSet("CRM", "LEAD", "status", "Lead Status");
        ensureOptionValue(leadStatus, "NEW", "New", 1, null);
        ensureOptionValue(leadStatus, "CONTACTED", "Contacted", 2, null);
        ensureOptionValue(leadStatus, "QUALIFIED", "Qualified", 3, null);
        ensureOptionValue(leadStatus, "UNQUALIFIED", "Unqualified", 4, null);
        ensureOptionValue(leadStatus, "CONVERTED", "Converted", 5, null);

        OptionSet leadSourceConfig = ensureOptionSet("CRM", "LEAD", "leadSource", "Lead Source");
        ensureOptionValue(leadSourceConfig, "WEB", "Web", 1, null);
        ensureOptionValue(leadSourceConfig, "REFERRAL", "Referral", 2, null);
        ensureOptionValue(leadSourceConfig, "COLD_CALL", "Cold Call", 3, null);
        ensureOptionValue(leadSourceConfig, "EMAIL_CAMPAIGN", "Email Campaign", 4, null);
        ensureOptionValue(leadSourceConfig, "SOCIAL_MEDIA", "Social Media", 5, null);
        ensureOptionValue(leadSourceConfig, "OTHER", "Other", 6, null);

        OptionSet quoteStatus = ensureOptionSet("CRM", "QUOTE", "status", "Quote Status");
        ensureOptionValue(quoteStatus, "DRAFT", "Draft", 1, null);
        ensureOptionValue(quoteStatus, "SENT", "Sent", 2, null);
        ensureOptionValue(quoteStatus, "ACCEPTED", "Accepted", 3, null);
        ensureOptionValue(quoteStatus, "REJECTED", "Rejected", 4, null);

        OptionSet timesheetStatus = ensureOptionSet("HR", "TIMESHEET", "status", "Timesheet Status");
        ensureOptionValue(timesheetStatus, "DRAFT", "Draft", 1, null);
        ensureOptionValue(timesheetStatus, "SUBMITTED", "Submitted", 2, null);
        ensureOptionValue(timesheetStatus, "APPROVED", "Approved", 3, null);
        ensureOptionValue(timesheetStatus, "REJECTED", "Rejected", 4, null);

        OptionSet taskStatus = ensureOptionSet("PM", "TASK", "status", "Task Status");
        ensureOptionValue(taskStatus, "TODO", "To Do", 1, null);
        ensureOptionValue(taskStatus, "IN_PROGRESS", "In Progress", 2, null);
        ensureOptionValue(taskStatus, "ON_HOLD", "On Hold", 3, null);
        ensureOptionValue(taskStatus, "IN_REVIEW", "In Review", 4, null);
        ensureOptionValue(taskStatus, "DONE", "Done", 5, null);

        OptionSet projectStatus = ensureOptionSet("PM", "PROJECT", "status", "Project Status");
        ensureOptionValue(projectStatus, "PLANNING", "Planning", 1, null);
        ensureOptionValue(projectStatus, "IN_PROGRESS", "In Progress", 2, null);
        ensureOptionValue(projectStatus, "ON_HOLD", "On Hold", 3, null);
        ensureOptionValue(projectStatus, "IN_REVIEW", "In Review", 4, null);
        ensureOptionValue(projectStatus, "DONE", "Done", 5, null);

        OptionSet priority = ensureOptionSet("PM", "TASK", "priority", "Priority");
        ensureOptionValue(priority, "LOW", "Low", 1, null);
        ensureOptionValue(priority, "MEDIUM", "Medium", 2, null);
        ensureOptionValue(priority, "HIGH", "High", 3, null);
        ensureOptionValue(priority, "CRITICAL", "Critical", 4, null);

        OptionSet projectPriority = ensureOptionSet("PM", "PROJECT", "priority", "Project Priority");
        ensureOptionValue(projectPriority, "LOW", "Low", 1, null);
        ensureOptionValue(projectPriority, "MEDIUM", "Medium", 2, null);
        ensureOptionValue(projectPriority, "HIGH", "High", 3, null);
        ensureOptionValue(projectPriority, "CRITICAL", "Critical", 4, null);
    }

    private void seedWorkflows() {
        WorkflowDefinition dealWorkflow = ensureWorkflowDefinition("CRM", "DEAL", "Default Deal Workflow", "PROSPECTING");
        ensureWorkflowTransition(dealWorkflow, "PROSPECTING", "QUALIFICATION", "Qualify", false, null, null);
        ensureWorkflowTransition(dealWorkflow, "QUALIFICATION", "PROPOSAL", "Propose", false, null, null);
        ensureWorkflowTransition(dealWorkflow, "PROPOSAL", "NEGOTIATION", "Negotiate", false, null, null);
        ensureWorkflowTransition(dealWorkflow, "NEGOTIATION", "CLOSED_WON", "Close Won", false, null, null);
        ensureWorkflowTransition(dealWorkflow, "NEGOTIATION", "CLOSED_LOST", "Close Lost", false, null, null);

        WorkflowDefinition timesheetWorkflow = ensureWorkflowDefinition("HR", "TIMESHEET", "Default Timesheet Workflow", "DRAFT");
        ensureWorkflowTransition(timesheetWorkflow, "DRAFT", "SUBMITTED", "Submit", false, null, null);
        ensureWorkflowTransition(timesheetWorkflow, "SUBMITTED", "APPROVED", "Approve", false, null, null);
        ensureWorkflowTransition(timesheetWorkflow, "SUBMITTED", "REJECTED", "Reject", false, null, null);

        WorkflowDefinition taskWorkflow = ensureWorkflowDefinition("PM", "TASK", "Default Task Workflow", "TODO");
        ensureWorkflowTransition(taskWorkflow, "TODO", "IN_PROGRESS", "Start", false, null, null);
        ensureWorkflowTransition(taskWorkflow, "IN_PROGRESS", "IN_REVIEW", "Review", false, null, null);
        ensureWorkflowTransition(taskWorkflow, "IN_REVIEW", "DONE", "Complete", false, null, null);
        ensureWorkflowTransition(taskWorkflow, "IN_PROGRESS", "ON_HOLD", "Hold", false, null, null);

        WorkflowDefinition projectWorkflow = ensureWorkflowDefinition("PM", "PROJECT", "Default Project Workflow", "PLANNING");
        ensureWorkflowTransition(projectWorkflow, "PLANNING", "IN_PROGRESS", "Start", false, null, null);
        ensureWorkflowTransition(projectWorkflow, "IN_PROGRESS", "IN_REVIEW", "Review", false, null, null);
        ensureWorkflowTransition(projectWorkflow, "IN_REVIEW", "DONE", "Complete", false, null, null);
        ensureWorkflowTransition(projectWorkflow, "IN_PROGRESS", "ON_HOLD", "Hold", false, null, null);
        ensureWorkflowTransition(projectWorkflow, "ON_HOLD", "IN_PROGRESS", "Resume", false, null, null);
    }

    private OptionSet ensureOptionSet(String module, String entity, String fieldName, String name) {
        return optionSetRepository.findByModuleAndEntityAndFieldNameAndIsDeletedFalse(module, entity, fieldName)
                .orElseGet(() -> optionSetRepository.save(OptionSet.builder()
                        .module(module)
                        .entity(entity)
                        .fieldName(fieldName)
                        .name(name)
                        .isActive(true)
                        .isSystem(true)
                        .build()));
    }

    private void ensureOptionValue(OptionSet optionSet, String value, String label, int sortOrder, String colorCode) {
        List<OptionValue> existing = optionValueRepository.findByOptionSetAndIsDeletedFalseOrderBySortOrderAsc(optionSet);
        boolean alreadyExists = existing.stream().anyMatch(item -> item.getValue().equalsIgnoreCase(value));
        if (alreadyExists) {
            return;
        }

        optionValueRepository.save(OptionValue.builder()
                .optionSet(optionSet)
                .value(value)
                .label(label)
                .sortOrder(sortOrder)
                .colorCode(colorCode)
                .isActive(true)
                .isDefault(sortOrder == 1)
                .build());
    }

    private WorkflowDefinition ensureWorkflowDefinition(String module, String entity, String name, String initialStatus) {
        return workflowDefinitionRepository.findByModuleAndEntityAndIsDefaultTrueAndIsDeletedFalse(module, entity)
                .orElseGet(() -> workflowDefinitionRepository.save(WorkflowDefinition.builder()
                        .module(module)
                        .entity(entity)
                        .name(name)
                        .initialStatus(initialStatus)
                        .isDefault(true)
                        .isActive(true)
                        .build()));
    }

    private void ensureWorkflowTransition(WorkflowDefinition definition, String from, String to,
                                          String actionLabel, boolean requiresApproval, String approverRole, Integer slaHours) {
        List<WorkflowTransition> existing = workflowTransitionRepository
                .findByWorkflowDefinitionAndIsDeletedFalseOrderByFromStatusAsc(definition);

        boolean exists = existing.stream()
                .anyMatch(item -> item.getFromStatus().equalsIgnoreCase(from)
                        && item.getToStatus().equalsIgnoreCase(to));
        if (exists) {
            return;
        }

        workflowTransitionRepository.save(WorkflowTransition.builder()
                .workflowDefinition(definition)
                .fromStatus(from)
                .toStatus(to)
                .actionLabel(actionLabel)
                .requiresApproval(requiresApproval)
                .approverRole(approverRole)
                .slaHours(slaHours)
                .isActive(true)
                .build());
    }
}
