package com.everx.hr.appraisal;

import com.everx.hr.appraisal.dto.AppraisalGoalDto;
import com.everx.hr.appraisal.dto.CreateAppraisalGoalRequest;
import com.everx.hr.appraisal.dto.UpdateAppraisalGoalRequest;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.util.SecurityUserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AppraisalGoalService {

    private final AppraisalGoalRepository appraisalGoalRepository;

    @Transactional(readOnly = true)
    public Page<AppraisalGoalDto> getGoals(UUID ownerId, Pageable pageable) {
        UUID resolvedOwnerId = ownerId != null ? ownerId : SecurityUserContext.getCurrentUserIdOrNull();
        if (resolvedOwnerId != null) {
            return appraisalGoalRepository.findByOwnerIdAndIsDeletedFalse(resolvedOwnerId, pageable)
                    .map(AppraisalGoalDto::fromEntity);
        }
        return appraisalGoalRepository.findAllByIsDeletedFalse(pageable)
                .map(AppraisalGoalDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public AppraisalGoalDto getGoal(UUID id) {
        return AppraisalGoalDto.fromEntity(appraisalGoalRepository.findById(id)
                .filter(goal -> !Boolean.TRUE.equals(goal.getIsDeleted()))
                .orElseThrow(() -> new EntityNotFoundException("Appraisal goal not found with id: " + id)));
    }

    public AppraisalGoalDto createGoal(CreateAppraisalGoalRequest request) {
        AppraisalGoal goal = new AppraisalGoal();
        UUID ownerId = request.getOwnerId() != null ? request.getOwnerId() : SecurityUserContext.getCurrentUserIdOrNull();
        if (ownerId == null) {
            throw new IllegalArgumentException("Owner ID is required to create an appraisal goal");
        }

        goal.setOwnerId(ownerId);
        goal.setOwnerName(request.getOwnerName());
        goal.setTitle(request.getTitle());
        goal.setDescription(request.getDescription());
        goal.setTargetDate(request.getTargetDate());
        goal.setStatus(request.getStatus() != null ? request.getStatus() : "NOT_STARTED");
        goal.setProgress(request.getProgress() != null ? request.getProgress() : 0);
        goal.setParentGoalId(request.getParentGoalId());
        goal.setParentGoalTitle(request.getParentGoalTitle());

        return AppraisalGoalDto.fromEntity(appraisalGoalRepository.save(goal));
    }

    public AppraisalGoalDto updateGoal(UUID id, UpdateAppraisalGoalRequest request) {
        AppraisalGoal goal = appraisalGoalRepository.findById(id)
                .filter(existing -> !Boolean.TRUE.equals(existing.getIsDeleted()))
                .orElseThrow(() -> new EntityNotFoundException("Appraisal goal not found with id: " + id));

        if (request.getOwnerId() != null) goal.setOwnerId(request.getOwnerId());
        if (request.getOwnerName() != null) goal.setOwnerName(request.getOwnerName());
        if (request.getTitle() != null) goal.setTitle(request.getTitle());
        if (request.getDescription() != null) goal.setDescription(request.getDescription());
        if (request.getTargetDate() != null) goal.setTargetDate(request.getTargetDate());
        if (request.getStatus() != null) goal.setStatus(request.getStatus());
        if (request.getProgress() != null) goal.setProgress(request.getProgress());
        if (request.getParentGoalId() != null) goal.setParentGoalId(request.getParentGoalId());
        if (request.getParentGoalTitle() != null) goal.setParentGoalTitle(request.getParentGoalTitle());

        return AppraisalGoalDto.fromEntity(appraisalGoalRepository.save(goal));
    }

    public void deleteGoal(UUID id) {
        AppraisalGoal goal = appraisalGoalRepository.findById(id)
                .filter(existing -> !Boolean.TRUE.equals(existing.getIsDeleted()))
                .orElseThrow(() -> new EntityNotFoundException("Appraisal goal not found with id: " + id));
        goal.softDelete();
        appraisalGoalRepository.save(goal);
    }
}
