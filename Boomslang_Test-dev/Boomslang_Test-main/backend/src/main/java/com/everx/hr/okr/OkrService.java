package com.everx.hr.okr;

import com.everx.hr.okr.dto.*;
import com.everx.hr.employee.EmployeeRepository;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OkrService {

    private final ObjectiveRepository objectiveRepository;
    private final KeyResultRepository keyResultRepository;
    private final OkrCycleRepository okrCycleRepository;
    private final EmployeeRepository employeeRepository;

    // ==================== OKR Cycles ====================

    @Transactional(readOnly = true)
    public List<OkrCycleDto> getAllCycles() {
        return okrCycleRepository.findAllActive().stream()
                .map(this::toCycleDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OkrCycleDto getCycle(UUID id) {
        OkrCycle cycle = okrCycleRepository.findByIdActive(id)
                .orElseThrow(() -> new EntityNotFoundException("OKR Cycle not found: " + id));
        return toCycleDto(cycle);
    }

    public OkrCycleDto createCycle(OkrCycleDto request) {
        OkrCycle cycle = new OkrCycle();
        cycle.setName(request.getName());
        cycle.setDescription(request.getDescription());
        cycle.setStartDate(request.getStartDate());
        cycle.setEndDate(request.getEndDate());
        cycle.setStatus(request.getStatus() != null ? request.getStatus() : "PLANNING");
        cycle.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);
        cycle.setCheckInFrequency(request.getCheckInFrequency() != null ? request.getCheckInFrequency() : "WEEKLY");
        cycle.setCompanyObjectivesCount(request.getCompanyObjectivesCount());
        cycle.setTeamObjectivesCount(request.getTeamObjectivesCount());
        cycle.setIndividualObjectivesCount(request.getIndividualObjectivesCount());
        cycle.setMaxKeyResultsPerObjective(request.getMaxKeyResultsPerObjective());

        OkrCycle saved = okrCycleRepository.save(cycle);
        return toCycleDto(saved);
    }

    public OkrCycleDto updateCycle(UUID id, OkrCycleDto request) {
        OkrCycle cycle = okrCycleRepository.findByIdActive(id)
                .orElseThrow(() -> new EntityNotFoundException("OKR Cycle not found: " + id));

        if (request.getName() != null) cycle.setName(request.getName());
        if (request.getDescription() != null) cycle.setDescription(request.getDescription());
        if (request.getStartDate() != null) cycle.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) cycle.setEndDate(request.getEndDate());
        if (request.getStatus() != null) cycle.setStatus(request.getStatus());
        if (request.getIsDefault() != null) cycle.setIsDefault(request.getIsDefault());
        if (request.getCheckInFrequency() != null) cycle.setCheckInFrequency(request.getCheckInFrequency());

        OkrCycle saved = okrCycleRepository.save(cycle);
        return toCycleDto(saved);
    }

    // ==================== Objectives ====================

    @Transactional(readOnly = true)
    public List<ObjectiveDto> getObjectivesByEmployee(UUID employeeId) {
        return objectiveRepository.findByEmployeeId(employeeId).stream()
                .map(this::toObjectiveDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ObjectiveDto> getObjectivesByCycle(UUID cycleId) {
        return objectiveRepository.findByCycleId(cycleId).stream()
                .map(this::toObjectiveDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ObjectiveDto getObjective(UUID id) {
        Objective objective = objectiveRepository.findByIdActive(id)
                .orElseThrow(() -> new EntityNotFoundException("Objective not found: " + id));
        return toObjectiveDto(objective);
    }

    public ObjectiveDto createObjective(CreateObjectiveRequest request) {
        // Validate cycle exists
        OkrCycle cycle = okrCycleRepository.findByIdActive(request.getCycleId())
                .orElseThrow(() -> new EntityNotFoundException("OKR Cycle not found: " + request.getCycleId()));

        // Check objective limit
        long existingCount = objectiveRepository.countByEmployeeIdAndCycleId(request.getEmployeeId(), request.getCycleId());
        int maxAllowed = getMaxObjectivesForCategory(request.getCategory(), cycle);
        if (existingCount >= maxAllowed) {
            throw new ValidationException("Maximum objectives limit reached for this cycle: " + maxAllowed);
        }

        Objective objective = new Objective();
        objective.setEmployeeId(request.getEmployeeId());
        objective.setCycleId(request.getCycleId());
        objective.setTitle(request.getTitle());
        objective.setDescription(request.getDescription());
        objective.setCategory(request.getCategory() != null ? request.getCategory() : "PROFESSIONAL");
        objective.setStatus("DRAFT");
        objective.setProgressPercent(0);
        objective.setWeight(request.getWeight() != null ? request.getWeight() : 1);
        objective.setAlignmentParentId(request.getAlignmentParentId());
        objective.setStartDate(request.getStartDate());
        objective.setEndDate(request.getEndDate());
        objective.setIsPrivate(request.getIsPrivate() != null ? request.getIsPrivate() : false);

        Objective savedObjective = objectiveRepository.save(objective);

        // Create key results if provided
        if (request.getKeyResults() != null && !request.getKeyResults().isEmpty()) {
            if (request.getKeyResults().size() > cycle.getMaxKeyResultsPerObjective()) {
                throw new ValidationException("Maximum key results per objective is: " + cycle.getMaxKeyResultsPerObjective());
            }

            for (CreateKeyResultRequest krRequest : request.getKeyResults()) {
                KeyResult kr = new KeyResult();
                kr.setObjectiveId(savedObjective.getId());
                kr.setTitle(krRequest.getTitle());
                kr.setDescription(krRequest.getDescription());
                kr.setTargetValue(krRequest.getTargetValue());
                kr.setCurrentValue(BigDecimal.ZERO);
                kr.setUnit(krRequest.getUnit() != null ? krRequest.getUnit() : "NUMBER");
                kr.setStatus("NOT_STARTED");
                kr.setProgressPercent(0);
                kr.setStartDate(krRequest.getStartDate());
                kr.setEndDate(krRequest.getEndDate());
                kr.setConfidenceLevel(krRequest.getConfidenceLevel() != null ? krRequest.getConfidenceLevel() : 5);
                kr.setWeight(krRequest.getWeight() != null ? krRequest.getWeight() : 1);
                keyResultRepository.save(kr);
            }
        }

        // Reload with key results
        return toObjectiveDto(objectiveRepository.findByIdActive(savedObjective.getId()).orElseThrow());
    }

    public ObjectiveDto updateObjective(UUID id, CreateObjectiveRequest request) {
        Objective objective = objectiveRepository.findByIdActive(id)
                .orElseThrow(() -> new EntityNotFoundException("Objective not found: " + id));

        if (request.getTitle() != null) objective.setTitle(request.getTitle());
        if (request.getDescription() != null) objective.setDescription(request.getDescription());
        if (request.getCategory() != null) objective.setCategory(request.getCategory());
        if (request.getWeight() != null) objective.setWeight(request.getWeight());
        if (request.getAlignmentParentId() != null) objective.setAlignmentParentId(request.getAlignmentParentId());
        if (request.getStartDate() != null) objective.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) objective.setEndDate(request.getEndDate());
        if (request.getIsPrivate() != null) objective.setIsPrivate(request.getIsPrivate());

        Objective saved = objectiveRepository.save(objective);
        recalculateObjectiveProgress(saved.getId());
        return toObjectiveDto(objectiveRepository.findByIdActive(saved.getId()).orElseThrow());
    }

    public ObjectiveDto updateObjectiveStatus(UUID id, String status) {
        Objective objective = objectiveRepository.findByIdActive(id)
                .orElseThrow(() -> new EntityNotFoundException("Objective not found: " + id));

        List<String> validStatuses = List.of("DRAFT", "ACTIVE", "COMPLETED", "CANCELLED");
        if (!validStatuses.contains(status)) {
            throw new ValidationException("Invalid status. Must be one of: " + validStatuses);
        }

        objective.setStatus(status);
        Objective saved = objectiveRepository.save(objective);
        return toObjectiveDto(saved);
    }

    // ==================== Key Results ====================

    public KeyResultDto updateKeyResultProgress(UUID keyResultId, UpdateKeyResultProgressRequest request) {
        KeyResult kr = keyResultRepository.findByIdActive(keyResultId)
                .orElseThrow(() -> new EntityNotFoundException("Key Result not found: " + keyResultId));

        kr.setCurrentValue(request.getCurrentValue());
        if (request.getConfidenceLevel() != null) {
            kr.setConfidenceLevel(request.getConfidenceLevel());
        }

        // Calculate progress percentage
        if (kr.getTargetValue() != null && kr.getTargetValue().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal progress = request.getCurrentValue()
                    .multiply(BigDecimal.valueOf(100))
                    .divide(kr.getTargetValue(), 2, RoundingMode.HALF_UP);
            kr.setProgressPercent(Math.min(progress.intValue(), 100));
        }

        // Update status based on progress
        if (kr.getProgressPercent() >= 100) {
            kr.setStatus("COMPLETED");
        } else if (kr.getProgressPercent() > 0) {
            kr.setStatus("IN_PROGRESS");
        }

        KeyResult saved = keyResultRepository.save(kr);

        // Recalculate parent objective progress
        recalculateObjectiveProgress(kr.getObjectiveId());

        return toKeyResultDto(saved);
    }

    // ==================== Helper Methods ====================

    private void recalculateObjectiveProgress(UUID objectiveId) {
        Objective objective = objectiveRepository.findByIdActive(objectiveId).orElse(null);
        if (objective == null) return;

        List<KeyResult> keyResults = keyResultRepository.findByObjectiveId(objectiveId);
        if (keyResults.isEmpty()) return;

        // Calculate weighted average of key result progress
        int totalWeight = keyResults.stream().mapToInt(kr -> kr.getWeight() != null ? kr.getWeight() : 1).sum();
        int weightedProgress = keyResults.stream()
                .mapToInt(kr -> (kr.getProgressPercent() != null ? kr.getProgressPercent() : 0) *
                        (kr.getWeight() != null ? kr.getWeight() : 1))
                .sum();

        int overallProgress = totalWeight > 0 ? weightedProgress / totalWeight : 0;
        objective.setProgressPercent(Math.min(overallProgress, 100));

        // Update objective status if all KRs completed
        long completedKRs = keyResults.stream().filter(kr -> "COMPLETED".equals(kr.getStatus())).count();
        if (completedKRs == keyResults.size() && overallProgress >= 100) {
            objective.setStatus("COMPLETED");
        }

        objectiveRepository.save(objective);
    }

    private int getMaxObjectivesForCategory(String category, OkrCycle cycle) {
        if (category == null) return cycle.getIndividualObjectivesCount();
        return switch (category.toUpperCase()) {
            case "COMPANY" -> cycle.getCompanyObjectivesCount();
            case "TEAM" -> cycle.getTeamObjectivesCount();
            default -> cycle.getIndividualObjectivesCount();
        };
    }

    // ==================== DTO Mappers ====================

    private OkrCycleDto toCycleDto(OkrCycle cycle) {
        return OkrCycleDto.builder()
                .id(cycle.getId())
                .name(cycle.getName())
                .description(cycle.getDescription())
                .startDate(cycle.getStartDate())
                .endDate(cycle.getEndDate())
                .status(cycle.getStatus())
                .isDefault(cycle.getIsDefault())
                .checkInFrequency(cycle.getCheckInFrequency())
                .companyObjectivesCount(cycle.getCompanyObjectivesCount())
                .teamObjectivesCount(cycle.getTeamObjectivesCount())
                .individualObjectivesCount(cycle.getIndividualObjectivesCount())
                .maxKeyResultsPerObjective(cycle.getMaxKeyResultsPerObjective())
                .createdAt(cycle.getCreatedAt() != null ? cycle.getCreatedAt().toString() : null)
                .updatedAt(cycle.getUpdatedAt() != null ? cycle.getUpdatedAt().toString() : null)
                .build();
    }

    private ObjectiveDto toObjectiveDto(Objective objective) {
        return ObjectiveDto.builder()
                .id(objective.getId())
                .employeeId(objective.getEmployeeId())
                .cycleId(objective.getCycleId())
                .title(objective.getTitle())
                .description(objective.getDescription())
                .category(objective.getCategory())
                .status(objective.getStatus())
                .progressPercent(objective.getProgressPercent())
                .weight(objective.getWeight())
                .alignmentParentId(objective.getAlignmentParentId())
                .startDate(objective.getStartDate())
                .endDate(objective.getEndDate())
                .keyResults(objective.getKeyResults() != null ?
                        objective.getKeyResults().stream().map(this::toKeyResultDto).collect(Collectors.toList()) :
                        keyResultRepository.findByObjectiveId(objective.getId()).stream()
                                .map(this::toKeyResultDto).collect(Collectors.toList()))
                .managerId(objective.getManagerId())
                .isPrivate(objective.getIsPrivate())
                .createdAt(objective.getCreatedAt() != null ? objective.getCreatedAt().toString() : null)
                .updatedAt(objective.getUpdatedAt() != null ? objective.getUpdatedAt().toString() : null)
                .build();
    }

    private KeyResultDto toKeyResultDto(KeyResult kr) {
        return KeyResultDto.builder()
                .id(kr.getId())
                .objectiveId(kr.getObjectiveId())
                .title(kr.getTitle())
                .description(kr.getDescription())
                .targetValue(kr.getTargetValue())
                .currentValue(kr.getCurrentValue())
                .unit(kr.getUnit())
                .status(kr.getStatus())
                .progressPercent(kr.getProgressPercent())
                .startDate(kr.getStartDate())
                .endDate(kr.getEndDate())
                .confidenceLevel(kr.getConfidenceLevel())
                .weight(kr.getWeight())
                .createdAt(kr.getCreatedAt() != null ? kr.getCreatedAt().toString() : null)
                .updatedAt(kr.getUpdatedAt() != null ? kr.getUpdatedAt().toString() : null)
                .build();
    }
}
