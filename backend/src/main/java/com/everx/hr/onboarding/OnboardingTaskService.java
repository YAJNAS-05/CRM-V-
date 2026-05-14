package com.everx.hr.onboarding;

import com.everx.hr.onboarding.dto.CreateOnboardingTaskRequest;
import com.everx.hr.onboarding.dto.OnboardingTaskDto;
import com.everx.hr.onboarding.dto.UpdateOnboardingTaskRequest;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class OnboardingTaskService {

    private final OnboardingTaskRepository onboardingTaskRepository;

    @Transactional(readOnly = true)
    public Page<OnboardingTaskDto> getTasks(UUID employeeId, String status, String category, Pageable pageable) {
        if (employeeId != null) {
            return onboardingTaskRepository.findByEmployeeIdAndIsDeletedFalse(employeeId, pageable).map(OnboardingTaskDto::fromEntity);
        }
        if (status != null && !status.isBlank()) {
            return onboardingTaskRepository.findByStatusAndIsDeletedFalse(status, pageable).map(OnboardingTaskDto::fromEntity);
        }
        if (category != null && !category.isBlank()) {
            return onboardingTaskRepository.findByCategoryAndIsDeletedFalse(category, pageable).map(OnboardingTaskDto::fromEntity);
        }
        return onboardingTaskRepository.findAllByIsDeletedFalse(pageable).map(OnboardingTaskDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public OnboardingTaskDto getTask(UUID id) {
        return OnboardingTaskDto.fromEntity(onboardingTaskRepository.findById(id)
                .filter(task -> !Boolean.TRUE.equals(task.getIsDeleted()))
                .orElseThrow(() -> new EntityNotFoundException("Onboarding task not found with id: " + id)));
    }

    public OnboardingTaskDto createTask(CreateOnboardingTaskRequest request) {
        OnboardingTask task = new OnboardingTask();
        task.setEmployeeId(request.getEmployeeId());
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setCategory(request.getCategory());
        task.setDueDate(request.getDueDate());
        task.setStatus(request.getStatus() != null ? request.getStatus() : "PENDING");
        task.setAssignedTo(request.getAssignedTo());
        task.setCompletedAt(request.getCompletedAt());
        return OnboardingTaskDto.fromEntity(onboardingTaskRepository.save(task));
    }

    public OnboardingTaskDto updateTask(UUID id, UpdateOnboardingTaskRequest request) {
        OnboardingTask task = onboardingTaskRepository.findById(id)
                .filter(existing -> !Boolean.TRUE.equals(existing.getIsDeleted()))
                .orElseThrow(() -> new EntityNotFoundException("Onboarding task not found with id: " + id));

        if (request.getEmployeeId() != null) task.setEmployeeId(request.getEmployeeId());
        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getCategory() != null) task.setCategory(request.getCategory());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getAssignedTo() != null) task.setAssignedTo(request.getAssignedTo());
        if (request.getCompletedAt() != null) task.setCompletedAt(request.getCompletedAt());

        return OnboardingTaskDto.fromEntity(onboardingTaskRepository.save(task));
    }

    public void deleteTask(UUID id) {
        OnboardingTask task = onboardingTaskRepository.findById(id)
                .filter(existing -> !Boolean.TRUE.equals(existing.getIsDeleted()))
                .orElseThrow(() -> new EntityNotFoundException("Onboarding task not found with id: " + id));
        task.softDelete();
        onboardingTaskRepository.save(task);
    }
}
