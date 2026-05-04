package com.everx.hr.leave;

import com.everx.hr.LeaveType;
import com.everx.hr.employee.EmployeeRepository;
import com.everx.hr.leave.dto.AdjustLeaveBalanceRequest;
import com.everx.hr.leave.dto.LeaveBalanceDto;
import com.everx.hr.leave.dto.SeedLeaveBalanceRequest;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LeaveBalanceService {

    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeavePolicyService leavePolicyService;
    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public List<LeaveBalanceDto> getBalancesByEmployee(UUID employeeId) {
        return leaveBalanceRepository.findByEmployeeIdAndIsDeletedFalse(employeeId)
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public List<LeaveBalanceDto> seedBalances(SeedLeaveBalanceRequest request) {
        employeeRepository.findByIdAndNotDeleted(request.getEmployeeId())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + request.getEmployeeId()));

        List<LeaveBalanceDto> results = new ArrayList<>();
        for (LeaveType leaveType : LeaveType.values()) {
            LeaveBalance balance = ensureBalance(request.getEmployeeId(), leaveType);
            results.add(toDto(balance));
        }
        return results;
    }

    @Transactional
    public LeaveBalanceDto adjustBalance(AdjustLeaveBalanceRequest request) {
        employeeRepository.findByIdAndNotDeleted(request.getEmployeeId())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + request.getEmployeeId()));

        LeaveBalance balance = ensureBalance(request.getEmployeeId(), request.getLeaveType());

        BigDecimal available = balance.getAvailableDays();
        BigDecimal used = balance.getUsedDays();
        BigDecimal pending = balance.getPendingDays();

        if (request.getDeltaAvailable() != null) {
            available = available.add(request.getDeltaAvailable());
        }
        if (request.getDeltaUsed() != null) {
            used = used.add(request.getDeltaUsed());
        }
        if (request.getDeltaPending() != null) {
            pending = pending.add(request.getDeltaPending());
        }

        if (available.compareTo(BigDecimal.ZERO) < 0) {
            throw new ValidationException("Available balance cannot be negative");
        }

        balance.setAvailableDays(available);
        balance.setUsedDays(used.max(BigDecimal.ZERO));
        balance.setPendingDays(pending.max(BigDecimal.ZERO));
        return toDto(leaveBalanceRepository.save(balance));
    }

    @Transactional
    public LeaveBalance ensureBalance(UUID employeeId, LeaveType leaveType) {
        return leaveBalanceRepository.findByEmployeeIdAndLeaveTypeAndIsDeletedFalse(employeeId, leaveType)
                .orElseGet(() -> {
                    LeaveBalance balance = new LeaveBalance();
                    balance.setEmployeeId(employeeId);
                    balance.setLeaveType(leaveType);
                    LeavePolicy policy = leavePolicyService.getActivePolicy(leaveType, LocalDate.now());
                    if (policy != null && policy.getAnnualEntitlement() != null) {
                        balance.setAvailableDays(policy.getAnnualEntitlement());
                    }
                    return leaveBalanceRepository.save(balance);
                });
    }

    @Transactional
    public void applyPending(UUID employeeId, LeaveType leaveType, BigDecimal days, LeavePolicy policy) {
        if (policy == null) {
            return;
        }

        LeaveBalance balance = ensureBalance(employeeId, leaveType);
        BigDecimal available = balance.getAvailableDays();
        BigDecimal pending = balance.getPendingDays();

        if (!Boolean.TRUE.equals(policy.getAllowNegative())) {
            BigDecimal free = available.subtract(pending);
            if (free.compareTo(days) < 0) {
                throw new ValidationException("Insufficient leave balance for " + leaveType + ": available " + free);
            }
        }

        balance.setPendingDays(pending.add(days));
        leaveBalanceRepository.save(balance);
    }

    @Transactional
    public void approve(UUID employeeId, LeaveType leaveType, BigDecimal days, LeavePolicy policy) {
        if (policy == null) {
            return;
        }

        LeaveBalance balance = ensureBalance(employeeId, leaveType);
        BigDecimal available = balance.getAvailableDays();
        BigDecimal used = balance.getUsedDays();
        BigDecimal pending = balance.getPendingDays();

        if (!Boolean.TRUE.equals(policy.getAllowNegative()) && available.subtract(days).compareTo(BigDecimal.ZERO) < 0) {
            throw new ValidationException("Insufficient leave balance for " + leaveType + ": available " + available);
        }

        balance.setAvailableDays(available.subtract(days));
        balance.setUsedDays(used.add(days));
        balance.setPendingDays(pending.subtract(days).max(BigDecimal.ZERO));
        leaveBalanceRepository.save(balance);
    }

    @Transactional
    public void rollbackPending(UUID employeeId, LeaveType leaveType, BigDecimal days) {
        LeaveBalance balance = ensureBalance(employeeId, leaveType);
        BigDecimal pending = balance.getPendingDays();
        balance.setPendingDays(pending.subtract(days).max(BigDecimal.ZERO));
        leaveBalanceRepository.save(balance);
    }

    private LeaveBalanceDto toDto(LeaveBalance balance) {
        LeaveBalanceDto dto = new LeaveBalanceDto();
        dto.setId(balance.getId());
        dto.setEmployeeId(balance.getEmployeeId());
        dto.setLeaveType(balance.getLeaveType());
        dto.setAvailableDays(balance.getAvailableDays());
        dto.setUsedDays(balance.getUsedDays());
        dto.setPendingDays(balance.getPendingDays());
        dto.setLastAccruedOn(balance.getLastAccruedOn());
        if (balance.getCreatedAt() != null) {
            dto.setCreatedAt(balance.getCreatedAt().toInstant());
        }
        if (balance.getUpdatedAt() != null) {
            dto.setUpdatedAt(balance.getUpdatedAt().toInstant());
        }
        return dto;
    }
}
