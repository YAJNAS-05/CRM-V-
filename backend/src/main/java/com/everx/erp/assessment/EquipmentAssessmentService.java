package com.everx.erp.assessment;

import com.everx.erp.acquisition.EquipmentAcquisition;
import com.everx.erp.acquisition.EquipmentAcquisitionRepository;
import com.everx.erp.assessment.dto.CreateEquipmentAssessmentRequest;
import com.everx.erp.assessment.dto.EquipmentAssessmentDto;
import com.everx.erp.equipment.EquipmentRepository;
import com.everx.erp.numbering.DocumentNumberGenerator;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EquipmentAssessmentService {

    private static final String[] VALID_TYPES = {"PHYSICAL", "REMOTE"};
    private static final String[] VALID_OUTCOMES = {"BUY", "REJECT", "NEGOTIATE"};

    private final EquipmentAssessmentRepository assessmentRepository;
    private final EquipmentAcquisitionRepository acquisitionRepository;
    private final EquipmentRepository equipmentRepository;
    private final DocumentNumberGenerator documentNumberGenerator;

    @Transactional
    public EquipmentAssessmentDto create(CreateEquipmentAssessmentRequest request) {
        validateType(request.getAssessmentType());
        validateOutcome(request.getOutcome());

        EquipmentAssessment entity = new EquipmentAssessment();
        entity.setAssessmentNumber(generateAssessmentNumber());
        applyRequest(entity, request);
        return toDto(assessmentRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public EquipmentAssessmentDto getById(UUID id) {
        return toDto(assessmentRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Equipment assessment not found with id: " + id)));
    }

    @Transactional(readOnly = true)
    public Page<EquipmentAssessmentDto> getAll(Pageable pageable) {
        return assessmentRepository.findAllNotDeleted(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<EquipmentAssessmentDto> getByAcquisition(UUID acquisitionId, Pageable pageable) {
        return assessmentRepository.findByAcquisitionId(acquisitionId, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<EquipmentAssessmentDto> getByOutcome(String outcome, Pageable pageable) {
        validateOutcome(outcome);
        return assessmentRepository.findByOutcome(outcome.toUpperCase(Locale.ROOT), pageable).map(this::toDto);
    }

    @Transactional
    public EquipmentAssessmentDto update(UUID id, CreateEquipmentAssessmentRequest request) {
        EquipmentAssessment entity = assessmentRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Equipment assessment not found with id: " + id));

        if (request.getAssessmentType() != null) {
            validateType(request.getAssessmentType());
        }
        if (request.getOutcome() != null) {
            validateOutcome(request.getOutcome());
        }

        applyPartialRequest(entity, request);
        return toDto(assessmentRepository.save(entity));
    }

    @Transactional
    public void delete(UUID id) {
        EquipmentAssessment entity = assessmentRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Equipment assessment not found with id: " + id));
        entity.softDelete();
        assessmentRepository.save(entity);
    }

    private void validateType(String type) {
        String normalized = type == null ? "" : type.toUpperCase(Locale.ROOT);
        for (String valid : VALID_TYPES) {
            if (valid.equals(normalized)) {
                return;
            }
        }
        throw new ValidationException("Invalid assessment type: " + type);
    }

    private void validateOutcome(String outcome) {
        String normalized = outcome == null ? "" : outcome.toUpperCase(Locale.ROOT);
        for (String valid : VALID_OUTCOMES) {
            if (valid.equals(normalized)) {
                return;
            }
        }
        throw new ValidationException("Invalid assessment outcome: " + outcome);
    }

    private void applyRequest(EquipmentAssessment entity, CreateEquipmentAssessmentRequest request) {
        UUID resolvedEquipmentId = resolveEquipmentId(request.getEquipmentId(), request.getAcquisitionId());
        entity.setAcquisitionId(request.getAcquisitionId());
        entity.setEquipmentId(resolvedEquipmentId);
        entity.setAssessmentType(request.getAssessmentType().toUpperCase(Locale.ROOT));
        entity.setInspectionDate(request.getInspectionDate());
        entity.setEngineerAssigned(request.getEngineerAssigned());
        entity.setTubeLifeRemaining(request.getTubeLifeRemaining());
        entity.setImageQualityRating(request.getImageQualityRating());
        entity.setConditionGrade(request.getConditionGrade());
        entity.setOutcome(request.getOutcome().toUpperCase(Locale.ROOT));
        entity.setNotes(request.getNotes());
    }

    private void applyPartialRequest(EquipmentAssessment entity, CreateEquipmentAssessmentRequest request) {
        UUID nextAcquisitionId = request.getAcquisitionId() != null
            ? request.getAcquisitionId()
            : entity.getAcquisitionId();
        UUID nextEquipmentId = request.getEquipmentId() != null
            ? request.getEquipmentId()
            : entity.getEquipmentId();

        entity.setAcquisitionId(nextAcquisitionId);
        entity.setEquipmentId(resolveEquipmentId(nextEquipmentId, nextAcquisitionId));

        if (request.getAssessmentType() != null) entity.setAssessmentType(request.getAssessmentType().toUpperCase(Locale.ROOT));
        if (request.getInspectionDate() != null) entity.setInspectionDate(request.getInspectionDate());
        if (request.getEngineerAssigned() != null) entity.setEngineerAssigned(request.getEngineerAssigned());
        if (request.getTubeLifeRemaining() != null) entity.setTubeLifeRemaining(request.getTubeLifeRemaining());
        if (request.getImageQualityRating() != null) entity.setImageQualityRating(request.getImageQualityRating());
        if (request.getConditionGrade() != null) entity.setConditionGrade(request.getConditionGrade());
        if (request.getOutcome() != null) entity.setOutcome(request.getOutcome().toUpperCase(Locale.ROOT));
        if (request.getNotes() != null) entity.setNotes(request.getNotes());
    }

    private UUID resolveEquipmentId(UUID equipmentId, UUID acquisitionId) {
        UUID resolvedEquipmentId = equipmentId;

        if (acquisitionId != null) {
            EquipmentAcquisition acquisition = acquisitionRepository.findByIdAndNotDeleted(acquisitionId)
                    .orElseThrow(() -> new EntityNotFoundException("Equipment acquisition not found with id: " + acquisitionId));

            if (acquisition.getEquipmentId() != null) {
                if (resolvedEquipmentId != null && !resolvedEquipmentId.equals(acquisition.getEquipmentId())) {
                    throw new ValidationException("Equipment ID does not match the selected acquisition");
                }
                resolvedEquipmentId = acquisition.getEquipmentId();
            }
        }

        if (resolvedEquipmentId != null) {
            UUID equipmentIdToValidate = resolvedEquipmentId;
            equipmentRepository.findByIdAndNotDeleted(equipmentIdToValidate)
                .orElseThrow(() -> new EntityNotFoundException("Equipment not found with id: " + equipmentIdToValidate));
        }

        return resolvedEquipmentId;
    }

    private String generateAssessmentNumber() {
        return documentNumberGenerator.generate(
                "ASS",
                candidate -> assessmentRepository.findByAssessmentNumber(candidate).isPresent()
        );
    }

    private EquipmentAssessmentDto toDto(EquipmentAssessment entity) {
        return new EquipmentAssessmentDto(
                entity.getId(),
                entity.getAssessmentNumber(),
                entity.getAcquisitionId(),
                entity.getEquipmentId(),
                entity.getAssessmentType(),
                entity.getInspectionDate(),
                entity.getEngineerAssigned(),
                entity.getTubeLifeRemaining(),
                entity.getImageQualityRating(),
                entity.getConditionGrade(),
                entity.getOutcome(),
                entity.getNotes(),
                entity.getCreatedAt() != null ? entity.getCreatedAt().toInstant() : null,
                entity.getUpdatedAt() != null ? entity.getUpdatedAt().toInstant() : null
        );
    }
}
