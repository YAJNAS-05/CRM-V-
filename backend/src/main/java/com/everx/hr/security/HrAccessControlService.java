package com.everx.hr.security;

import com.everx.hr.employee.Employee;
import com.everx.hr.employee.EmployeeRepository;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.util.SecurityUserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HrAccessControlService {

    private final EmployeeRepository employeeRepository;

    public UUID requireCurrentUserId() {
        return SecurityUserContext.getCurrentUserId()
                .orElseThrow(() -> new AccessDeniedException("Unauthenticated user"));
    }

    public UUID requireCurrentEmployeeId() {
        UUID currentUserId = requireCurrentUserId();
        return employeeRepository.findByUserIdAndNotDeleted(currentUserId)
                .map(Employee::getId)
                .orElseThrow(() -> new EntityNotFoundException("Employee profile not found for current user"));
    }

    public UUID resolveCurrentApproverId() {
        UUID currentUserId = requireCurrentUserId();
        return employeeRepository.findByUserIdAndNotDeleted(currentUserId)
                .map(Employee::getId)
                .orElse(currentUserId);
    }

    public void assertCanAccessEmployee(UUID employeeId) {
        if (employeeId == null) {
            throw new AccessDeniedException("Employee scope is required");
        }
        if (hasOrgOrTeamScope()) {
            return;
        }
        UUID currentEmployeeId = requireCurrentEmployeeId();
        if (!currentEmployeeId.equals(employeeId)) {
            throw new AccessDeniedException("You are not allowed to access another employee's data");
        }
    }

    public void assertCanAccessUserScopedResource(UUID userId) {
        if (userId == null) {
            throw new AccessDeniedException("User scope is required");
        }
        if (hasOrgOrTeamScope()) {
            return;
        }
        UUID currentUserId = requireCurrentUserId();
        if (!currentUserId.equals(userId)) {
            throw new AccessDeniedException("You are not allowed to access another user's data");
        }
    }

    public boolean hasOrgOrTeamScope() {
        return hasAnyAuthority("DATA_SCOPE_ORG", "DATA_SCOPE_TEAM", "HR_VIEW", "HR_EMPLOYEE_VIEW", "HR_EDIT");
    }

    public boolean hasAnyAuthority(String... authorities) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        for (String authority : authorities) {
            boolean hasAuthority = authentication.getAuthorities().stream()
                    .anyMatch(granted -> authority.equals(granted.getAuthority()));
            if (hasAuthority) {
                return true;
            }
        }
        return false;
    }
}