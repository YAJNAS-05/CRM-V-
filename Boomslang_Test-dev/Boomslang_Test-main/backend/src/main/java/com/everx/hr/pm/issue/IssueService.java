package com.everx.hr.pm.issue;

import com.everx.hr.pm.issue.dto.CreateIssueRequest;
import com.everx.hr.pm.issue.dto.IssueDto;
import com.everx.hr.pm.issue.dto.UpdateIssueRequest;
import com.everx.hr.project.ProjectAccessHelper;
import com.everx.platform.config.service.OptionSetService;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class IssueService {

    private static final String MODULE_PM = "PM";
    private static final String ENTITY_ISSUE = "ISSUE";
    private static final String FIELD_STATUS = "status";
    private static final String FIELD_PRIORITY = "priority";
    private static final String DEFAULT_STATUS = "OPEN";
    private static final String DEFAULT_PRIORITY = "MEDIUM";

    private final ProjectIssueRepository issueRepository;
    private final ProjectAccessHelper projectAccessHelper;
    private final OptionSetService optionSetService;

    @Transactional(readOnly = true)
    public Page<IssueDto> getIssues(UUID projectId, Pageable pageable) {
        projectAccessHelper.assertCanViewProject(projectId);
        return issueRepository.findByProjectIdAndIsDeletedFalse(projectId, pageable)
                .map(IssueDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public IssueDto getIssue(UUID issueId) {
        ProjectIssue issue = issueRepository.findByIdAndIsDeletedFalse(issueId)
                .orElseThrow(() -> new EntityNotFoundException("Issue not found with id: " + issueId));
        projectAccessHelper.assertCanViewProject(issue.getProjectId());
        return IssueDto.fromEntity(issue);
    }

    public IssueDto createIssue(CreateIssueRequest request) {
        projectAccessHelper.assertCanManageProject(request.getProjectId());

        ProjectIssue issue = new ProjectIssue();
        issue.setProjectId(request.getProjectId());
        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setAssigneeId(request.getAssigneeId());
        issue.setDueDate(request.getDueDate());

        String priority = normalizeValue(request.getPriority());
        if (priority == null) {
            priority = optionSetService.resolveDefaultValue(MODULE_PM, ENTITY_ISSUE, FIELD_PRIORITY, DEFAULT_PRIORITY);
        }
        validateOptionValue(MODULE_PM, ENTITY_ISSUE, FIELD_PRIORITY, priority, "Issue priority");
        issue.setPriority(priority);

        String status = normalizeValue(request.getStatus());
        if (status == null) {
            status = optionSetService.resolveDefaultValue(MODULE_PM, ENTITY_ISSUE, FIELD_STATUS, DEFAULT_STATUS);
        }
        validateOptionValue(MODULE_PM, ENTITY_ISSUE, FIELD_STATUS, status, "Issue status");
        issue.setStatus(status);

        return IssueDto.fromEntity(issueRepository.save(issue));
    }

    public IssueDto updateIssue(UUID issueId, UpdateIssueRequest request) {
        ProjectIssue issue = issueRepository.findByIdAndIsDeletedFalse(issueId)
                .orElseThrow(() -> new EntityNotFoundException("Issue not found with id: " + issueId));
        projectAccessHelper.assertCanManageProject(issue.getProjectId());

        if (request.getTitle() != null) issue.setTitle(request.getTitle());
        if (request.getDescription() != null) issue.setDescription(request.getDescription());
        if (request.getAssigneeId() != null) issue.setAssigneeId(request.getAssigneeId());
        if (request.getDueDate() != null) issue.setDueDate(request.getDueDate());

        String priority = normalizeValue(request.getPriority());
        if (priority != null) {
            validateOptionValue(MODULE_PM, ENTITY_ISSUE, FIELD_PRIORITY, priority, "Issue priority");
            issue.setPriority(priority);
        }

        String status = normalizeValue(request.getStatus());
        if (status != null) {
            validateOptionValue(MODULE_PM, ENTITY_ISSUE, FIELD_STATUS, status, "Issue status");
            issue.setStatus(status);
        }

        return IssueDto.fromEntity(issueRepository.save(issue));
    }

    public void deleteIssue(UUID issueId) {
        ProjectIssue issue = issueRepository.findByIdAndIsDeletedFalse(issueId)
                .orElseThrow(() -> new EntityNotFoundException("Issue not found with id: " + issueId));
        projectAccessHelper.assertCanManageProject(issue.getProjectId());
        issue.softDelete();
        issueRepository.save(issue);
    }

    private void validateOptionValue(String module, String entity, String field, String value, String label) {
        if (!optionSetService.isValidOptionValue(module, entity, field, value)) {
            throw new ValidationException(label + " is not configured");
        }
    }

    private String normalizeValue(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
