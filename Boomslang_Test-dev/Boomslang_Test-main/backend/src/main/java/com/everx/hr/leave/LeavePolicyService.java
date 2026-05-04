package com.everx.hr.leave;

import com.everx.hr.leave.dto.CreateLeavePolicyRequest;
import com.everx.hr.leave.dto.LeavePolicyDto;
import com.everx.hr.leave.dto.UpdateLeavePolicyRequest;
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
public class LeavePolicyService {

    private final LeavePolicyRepository leavePolicyRepository;

    @Transactional
    public LeavePolicyDto createPolicy(CreateLeavePolicyRequest request) {
        validatePolicyDates(request.getEffectiveFrom(), request.getEffectiveTo());

        LeavePolicy policy = new LeavePolicy();
        apply(policy, request);
        return toDto(leavePolicyRepository.save(policy));
    }

    @Transactional(readOnly = true)
    public LeavePolicyDto getPolicy(UUID id) {
        LeavePolicy policy = leavePolicyRepository.findById(id)
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .orElseThrow(() -> new EntityNotFoundException("Leave policy not found with id: " + id));
        return toDto(policy);
    }

    @Transactional(readOnly = true)
    public Page<LeavePolicyDto> getPolicies(Pageable pageable) {
        return leavePolicyRepository.findAllByIsDeletedFalse(pageable)
                .map(this::toDto);
    }

    @Transactional
    public LeavePolicyDto updatePolicy(UUID id, UpdateLeavePolicyRequest request) {
        LeavePolicy policy = leavePolicyRepository.findById(id)
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .orElseThrow(() -> new EntityNotFoundException("Leave policy not found with id: " + id));

        validatePolicyDates(request.getEffectiveFrom(), request.getEffectiveTo());

        if (request.getName() != null) policy.setName(request.getName());
        if (request.getLeaveType() != null) policy.setLeaveType(request.getLeaveType());
        if (request.getAnnualEntitlement() != null) policy.setAnnualEntitlement(request.getAnnualEntitlement());
        if (request.getAccrualFrequency() != null) policy.setAccrualFrequency(request.getAccrualFrequency());
        if (request.getCarryForwardLimit() != null) policy.setCarryForwardLimit(request.getCarryForwardLimit());
        if (request.getMaxBalance() != null) policy.setMaxBalance(request.getMaxBalance());
        if (request.getAllowNegative() != null) policy.setAllowNegative(request.getAllowNegative());
        if (request.getRequiresApproval() != null) policy.setRequiresApproval(request.getRequiresApproval());
        if (request.getMinServiceDays() != null) policy.setMinServiceDays(request.getMinServiceDays());
        if (request.getEffectiveFrom() != null) policy.setEffectiveFrom(request.getEffectiveFrom());
        if (request.getEffectiveTo() != null) policy.setEffectiveTo(request.getEffectiveTo());
        if (request.getIsActive() != null) policy.setIsActive(request.getIsActive());
        if (request.getDescription() != null) policy.setDescription(request.getDescription());

        return toDto(leavePolicyRepository.save(policy));
    }

    @Transactional
    public LeavePolicyDto togglePolicy(UUID id, boolean active) {
        LeavePolicy policy = leavePolicyRepository.findById(id)
                .filter(p -> !Boolean.TRUE.equals(p.getIsDeleted()))
                .orElseThrow(() -> new EntityNotFoundException("Leave policy not found with id: " + id));
        policy.setIsActive(active);
        return toDto(leavePolicyRepository.save(policy));
    }

    @Transactional(readOnly = true)
    public LeavePolicy getActivePolicy(com.everx.hr.LeaveType leaveType, java.time.LocalDate date) {
        return leavePolicyRepository.findActivePolicy(leaveType, date).orElse(null);
    }

    private void validatePolicyDates(java.time.LocalDate from, java.time.LocalDate to) {
        if (from != null && to != null && to.isBefore(from)) {
            throw new ValidationException("Policy effective end date cannot be before start date");
        }
    }

    private void apply(LeavePolicy policy, CreateLeavePolicyRequest request) {
        policy.setName(request.getName());
        policy.setLeaveType(request.getLeaveType());
        policy.setAnnualEntitlement(request.getAnnualEntitlement());
        if (request.getAccrualFrequency() != null) policy.setAccrualFrequency(request.getAccrualFrequency());
        policy.setCarryForwardLimit(request.getCarryForwardLimit());
        policy.setMaxBalance(request.getMaxBalance());
        policy.setAllowNegative(Boolean.TRUE.equals(request.getAllowNegative()));
        policy.setRequiresApproval(request.getRequiresApproval() == null || request.getRequiresApproval());
        policy.setMinServiceDays(request.getMinServiceDays());
        policy.setEffectiveFrom(request.getEffectiveFrom());
        policy.setEffectiveTo(request.getEffectiveTo());
        policy.setIsActive(request.getIsActive() == null || request.getIsActive());
        policy.setDescription(request.getDescription());
    }

    private LeavePolicyDto toDto(LeavePolicy policy) {
        LeavePolicyDto dto = new LeavePolicyDto();
        dto.setId(policy.getId());
        dto.setName(policy.getName());
        dto.setLeaveType(policy.getLeaveType());
        dto.setAnnualEntitlement(policy.getAnnualEntitlement());
        dto.setAccrualFrequency(policy.getAccrualFrequency());
        dto.setCarryForwardLimit(policy.getCarryForwardLimit());
        dto.setMaxBalance(policy.getMaxBalance());
        dto.setAllowNegative(policy.getAllowNegative());
        dto.setRequiresApproval(policy.getRequiresApproval());
        dto.setMinServiceDays(policy.getMinServiceDays());
        dto.setEffectiveFrom(policy.getEffectiveFrom());
        dto.setEffectiveTo(policy.getEffectiveTo());
        dto.setIsActive(policy.getIsActive());
        dto.setDescription(policy.getDescription());
        if (policy.getCreatedAt() != null) {
            dto.setCreatedAt(policy.getCreatedAt().toInstant());
        }
        if (policy.getUpdatedAt() != null) {
            dto.setUpdatedAt(policy.getUpdatedAt().toInstant());
        }
        return dto;
    }
}
