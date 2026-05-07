package com.everx.hr.project;

import com.everx.hr.employee.Employee;
import com.everx.hr.employee.EmployeeRepository;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import com.everx.shared.util.SecurityUserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectAccessHelper {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final EmployeeRepository employeeRepository;

    public Project requireProject(UUID projectId) {
        return projectRepository.findByIdAndIsDeletedFalse(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found with id: " + projectId));
    }

    public void assertCanViewProject(UUID projectId) {
        assertCanViewProject(requireProject(projectId));
    }

    public void assertCanManageProject(UUID projectId) {
        assertCanManageProject(requireProject(projectId));
    }

    public void assertCanViewProject(Project project) {
        UUID userId = SecurityUserContext.getCurrentUserIdOrNull();
        UUID employeeId = resolveEmployeeId(userId);
        if (userId == null && employeeId == null) {
            throw new ValidationException("Not authorized to access this project");
        }

        boolean owner = userId != null && userId.equals(project.getOwnerId());
        boolean member = employeeId != null && projectMemberRepository
                .findByProjectIdAndEmployeeIdAndIsDeletedFalse(project.getId(), employeeId)
                .isPresent();
        if (!owner && !member) {
            throw new ValidationException("Not authorized to access this project");
        }
    }

    public void assertCanManageProject(Project project) {
        UUID userId = SecurityUserContext.getCurrentUserIdOrNull();
        UUID employeeId = resolveEmployeeId(userId);
        if (userId == null && employeeId == null) {
            throw new ValidationException("Not authorized to modify this project");
        }

        boolean owner = userId != null && userId.equals(project.getOwnerId());
        if (owner) {
            return;
        }

        if (employeeId == null) {
            throw new ValidationException("Not authorized to modify this project");
        }

        ProjectMember membership = projectMemberRepository
                .findByProjectIdAndEmployeeIdAndIsDeletedFalse(project.getId(), employeeId)
                .orElse(null);
        if (membership == null) {
            throw new ValidationException("Not authorized to modify this project");
        }
        String role = membership.getRole() != null ? membership.getRole().trim() : "";
        boolean canManage = "MANAGER".equalsIgnoreCase(role) || "LEAD".equalsIgnoreCase(role);
        if (!canManage) {
            throw new ValidationException("Not authorized to modify this project");
        }
    }

    private UUID resolveEmployeeId(UUID userId) {
        if (userId == null) {
            return null;
        }
        return employeeRepository.findByUserIdAndNotDeleted(userId)
                .map(Employee::getId)
                .orElse(null);
    }
}
