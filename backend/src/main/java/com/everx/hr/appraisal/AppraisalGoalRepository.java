package com.everx.hr.appraisal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AppraisalGoalRepository extends JpaRepository<AppraisalGoal, UUID> {

    Page<AppraisalGoal> findByOwnerIdAndIsDeletedFalse(UUID ownerId, Pageable pageable);

    Page<AppraisalGoal> findAllByIsDeletedFalse(Pageable pageable);
}
