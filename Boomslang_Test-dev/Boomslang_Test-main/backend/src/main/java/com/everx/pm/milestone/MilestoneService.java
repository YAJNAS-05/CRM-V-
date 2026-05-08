package com.everx.pm.milestone;

import com.everx.pm.milestone.dto.CreateMilestoneRequest;
import com.everx.pm.milestone.dto.MilestoneDto;
import com.everx.pm.milestone.dto.UpdateMilestoneRequest;
import com.everx.pm.project.ProjectAccessHelper;
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
public class MilestoneService {

    private static final String MODULE_PM = "PM";
    private static final String ENTITY_MILESTONE = "MILESTONE";
    private static final String FIELD_STATUS = "status";
    private static final String DEFAULT_STATUS = "OPEN";

    private final ProjectMilestoneRepository milestoneRepository;
    private final ProjectAccessHelper projectAccessHelper;
    private final OptionSetService optionSetService;

    @Transactional(readOnly = true)
    public Page<MilestoneDto> getMilestones(UUID projectId, Pageable pageable) {
        projectAccessHelper.assertCanViewProject(projectId);
        return milestoneRepository.findByProjectIdAndIsDeletedFalse(projectId, pageable)
                .map(MilestoneDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public MilestoneDto getMilestone(UUID milestoneId) {
        ProjectMilestone milestone = milestoneRepository.findByIdAndIsDeletedFalse(milestoneId)
                .orElseThrow(() -> new EntityNotFoundException("Milestone not found with id: " + milestoneId));
        projectAccessHelper.assertCanViewProject(milestone.getProjectId());
        return MilestoneDto.fromEntity(milestone);
    }

    public MilestoneDto createMilestone(CreateMilestoneRequest request) {
        projectAccessHelper.assertCanManageProject(request.getProjectId());

        ProjectMilestone milestone = new ProjectMilestone();
        milestone.setProjectId(request.getProjectId());
        milestone.setTitle(request.getTitle());
        milestone.setDescription(request.getDescription());
        String status = normalizeValue(request.getStatus());
        if (status == null) {
            status = optionSetService.resolveDefaultValue(MODULE_PM, ENTITY_MILESTONE, FIELD_STATUS, DEFAULT_STATUS);
        }
        validateOptionValue(MODULE_PM, ENTITY_MILESTONE, FIELD_STATUS, status, "Milestone status");
        milestone.setStatus(status);
        milestone.setDueDate(request.getDueDate());

        return MilestoneDto.fromEntity(milestoneRepository.save(milestone));
    }

    public MilestoneDto updateMilestone(UUID milestoneId, UpdateMilestoneRequest request) {
        ProjectMilestone milestone = milestoneRepository.findByIdAndIsDeletedFalse(milestoneId)
                .orElseThrow(() -> new EntityNotFoundException("Milestone not found with id: " + milestoneId));
        projectAccessHelper.assertCanManageProject(milestone.getProjectId());

        if (request.getTitle() != null) milestone.setTitle(request.getTitle());
        if (request.getDescription() != null) milestone.setDescription(request.getDescription());
        String status = normalizeValue(request.getStatus());
        if (status != null) {
            validateOptionValue(MODULE_PM, ENTITY_MILESTONE, FIELD_STATUS, status, "Milestone status");
            milestone.setStatus(status);
        }
        if (request.getDueDate() != null) milestone.setDueDate(request.getDueDate());
        if (request.getCompletedAt() != null) milestone.setCompletedAt(request.getCompletedAt());

        return MilestoneDto.fromEntity(milestoneRepository.save(milestone));
    }

    public void deleteMilestone(UUID milestoneId) {
        ProjectMilestone milestone = milestoneRepository.findByIdAndIsDeletedFalse(milestoneId)
                .orElseThrow(() -> new EntityNotFoundException("Milestone not found with id: " + milestoneId));
        projectAccessHelper.assertCanManageProject(milestone.getProjectId());
        milestone.softDelete();
        milestoneRepository.save(milestone);
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
