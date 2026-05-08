package com.everx.pm.risk;

import com.everx.pm.risk.dto.CreateRiskRequest;
import com.everx.pm.risk.dto.RiskDto;
import com.everx.pm.risk.dto.UpdateRiskRequest;
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
public class RiskService {

    private static final String MODULE_PM = "PM";
    private static final String ENTITY_RISK = "RISK";
    private static final String FIELD_STATUS = "status";
    private static final String FIELD_SEVERITY = "severity";
    private static final String DEFAULT_STATUS = "OPEN";
    private static final String DEFAULT_SEVERITY = "MEDIUM";

    private final ProjectRiskRepository riskRepository;
    private final ProjectAccessHelper projectAccessHelper;
    private final OptionSetService optionSetService;

    @Transactional(readOnly = true)
    public Page<RiskDto> getRisks(UUID projectId, Pageable pageable) {
        projectAccessHelper.assertCanViewProject(projectId);
        return riskRepository.findByProjectIdAndIsDeletedFalse(projectId, pageable)
                .map(RiskDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public RiskDto getRisk(UUID riskId) {
        ProjectRisk risk = riskRepository.findByIdAndIsDeletedFalse(riskId)
                .orElseThrow(() -> new EntityNotFoundException("Risk not found with id: " + riskId));
        projectAccessHelper.assertCanViewProject(risk.getProjectId());
        return RiskDto.fromEntity(risk);
    }

    public RiskDto createRisk(CreateRiskRequest request) {
        projectAccessHelper.assertCanManageProject(request.getProjectId());

        ProjectRisk risk = new ProjectRisk();
        risk.setProjectId(request.getProjectId());
        risk.setTitle(request.getTitle());
        risk.setDescription(request.getDescription());
        risk.setOwnerId(request.getOwnerId());
        risk.setMitigationPlan(request.getMitigationPlan());
        risk.setDueDate(request.getDueDate());

        String severity = normalizeValue(request.getSeverity());
        if (severity == null) {
            severity = optionSetService.resolveDefaultValue(MODULE_PM, ENTITY_RISK, FIELD_SEVERITY, DEFAULT_SEVERITY);
        }
        validateOptionValue(MODULE_PM, ENTITY_RISK, FIELD_SEVERITY, severity, "Risk severity");
        risk.setSeverity(severity);

        String status = normalizeValue(request.getStatus());
        if (status == null) {
            status = optionSetService.resolveDefaultValue(MODULE_PM, ENTITY_RISK, FIELD_STATUS, DEFAULT_STATUS);
        }
        validateOptionValue(MODULE_PM, ENTITY_RISK, FIELD_STATUS, status, "Risk status");
        risk.setStatus(status);

        return RiskDto.fromEntity(riskRepository.save(risk));
    }

    public RiskDto updateRisk(UUID riskId, UpdateRiskRequest request) {
        ProjectRisk risk = riskRepository.findByIdAndIsDeletedFalse(riskId)
                .orElseThrow(() -> new EntityNotFoundException("Risk not found with id: " + riskId));
        projectAccessHelper.assertCanManageProject(risk.getProjectId());

        if (request.getTitle() != null) risk.setTitle(request.getTitle());
        if (request.getDescription() != null) risk.setDescription(request.getDescription());
        if (request.getOwnerId() != null) risk.setOwnerId(request.getOwnerId());
        if (request.getMitigationPlan() != null) risk.setMitigationPlan(request.getMitigationPlan());
        if (request.getDueDate() != null) risk.setDueDate(request.getDueDate());

        String severity = normalizeValue(request.getSeverity());
        if (severity != null) {
            validateOptionValue(MODULE_PM, ENTITY_RISK, FIELD_SEVERITY, severity, "Risk severity");
            risk.setSeverity(severity);
        }

        String status = normalizeValue(request.getStatus());
        if (status != null) {
            validateOptionValue(MODULE_PM, ENTITY_RISK, FIELD_STATUS, status, "Risk status");
            risk.setStatus(status);
        }

        return RiskDto.fromEntity(riskRepository.save(risk));
    }

    public void deleteRisk(UUID riskId) {
        ProjectRisk risk = riskRepository.findByIdAndIsDeletedFalse(riskId)
                .orElseThrow(() -> new EntityNotFoundException("Risk not found with id: " + riskId));
        projectAccessHelper.assertCanManageProject(risk.getProjectId());
        risk.softDelete();
        riskRepository.save(risk);
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
