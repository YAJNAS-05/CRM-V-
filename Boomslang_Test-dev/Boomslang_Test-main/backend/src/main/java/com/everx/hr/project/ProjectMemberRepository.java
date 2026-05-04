package com.everx.hr.project;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, UUID> {

    Optional<ProjectMember> findByProjectIdAndEmployeeIdAndIsDeletedFalse(UUID projectId, UUID employeeId);

    List<ProjectMember> findByProjectIdAndIsDeletedFalse(UUID projectId);
}
