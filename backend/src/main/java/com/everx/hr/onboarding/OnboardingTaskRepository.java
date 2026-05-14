package com.everx.hr.onboarding;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OnboardingTaskRepository extends JpaRepository<OnboardingTask, UUID> {

    Page<OnboardingTask> findAllByIsDeletedFalse(Pageable pageable);

    Page<OnboardingTask> findByEmployeeIdAndIsDeletedFalse(UUID employeeId, Pageable pageable);

    Page<OnboardingTask> findByStatusAndIsDeletedFalse(String status, Pageable pageable);

    Page<OnboardingTask> findByCategoryAndIsDeletedFalse(String category, Pageable pageable);
}
