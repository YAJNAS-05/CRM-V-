package com.everx.pm.sprint;

import com.everx.pm.sprint.dto.CreateSprintRequest;
import com.everx.pm.sprint.dto.SprintDto;
import com.everx.pm.sprint.dto.UpdateSprintRequest;
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
public class SprintService {

    private static final String MODULE_PM = "PM";
    private static final String ENTITY_SPRINT = "SPRINT";
    private static final String FIELD_STATUS = "status";
    private static final String DEFAULT_STATUS = "PLANNED";

    private final ProjectSprintRepository sprintRepository;
    private final ProjectAccessHelper projectAccessHelper;
    private final OptionSetService optionSetService;

    @Transactional(readOnly = true)
    public Page<SprintDto> getSprints(UUID projectId, Pageable pageable) {
        projectAccessHelper.assertCanViewProject(projectId);
        return sprintRepository.findByProjectIdAndIsDeletedFalse(projectId, pageable)
                .map(SprintDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public SprintDto getSprint(UUID sprintId) {
        ProjectSprint sprint = sprintRepository.findByIdAndIsDeletedFalse(sprintId)
                .orElseThrow(() -> new EntityNotFoundException("Sprint not found with id: " + sprintId));
        projectAccessHelper.assertCanViewProject(sprint.getProjectId());
        return SprintDto.fromEntity(sprint);
    }

    public SprintDto createSprint(CreateSprintRequest request) {
        projectAccessHelper.assertCanManageProject(request.getProjectId());

        ProjectSprint sprint = new ProjectSprint();
        sprint.setProjectId(request.getProjectId());
        sprint.setName(request.getName());
        sprint.setGoal(request.getGoal());
        String status = normalizeValue(request.getStatus());
        if (status == null) {
            status = optionSetService.resolveDefaultValue(MODULE_PM, ENTITY_SPRINT, FIELD_STATUS, DEFAULT_STATUS);
        }
        validateOptionValue(MODULE_PM, ENTITY_SPRINT, FIELD_STATUS, status, "Sprint status");
        sprint.setStatus(status);
        sprint.setStartDate(request.getStartDate());
        sprint.setEndDate(request.getEndDate());
        sprint.setCapacityHours(request.getCapacityHours());

        return SprintDto.fromEntity(sprintRepository.save(sprint));
    }

    public SprintDto updateSprint(UUID sprintId, UpdateSprintRequest request) {
        ProjectSprint sprint = sprintRepository.findByIdAndIsDeletedFalse(sprintId)
                .orElseThrow(() -> new EntityNotFoundException("Sprint not found with id: " + sprintId));
        projectAccessHelper.assertCanManageProject(sprint.getProjectId());

        if (request.getName() != null) sprint.setName(request.getName());
        if (request.getGoal() != null) sprint.setGoal(request.getGoal());
        String status = normalizeValue(request.getStatus());
        if (status != null) {
            validateOptionValue(MODULE_PM, ENTITY_SPRINT, FIELD_STATUS, status, "Sprint status");
            sprint.setStatus(status);
        }
        if (request.getStartDate() != null) sprint.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) sprint.setEndDate(request.getEndDate());
        if (request.getCapacityHours() != null) sprint.setCapacityHours(request.getCapacityHours());

        return SprintDto.fromEntity(sprintRepository.save(sprint));
    }

    public void deleteSprint(UUID sprintId) {
        ProjectSprint sprint = sprintRepository.findByIdAndIsDeletedFalse(sprintId)
                .orElseThrow(() -> new EntityNotFoundException("Sprint not found with id: " + sprintId));
        projectAccessHelper.assertCanManageProject(sprint.getProjectId());
        sprint.softDelete();
        sprintRepository.save(sprint);
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
