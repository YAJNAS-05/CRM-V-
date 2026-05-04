package com.everx.hr.payroll;

import com.everx.hr.PayrollCalculationType;
import com.everx.hr.PayrollComponentType;
import com.everx.hr.employee.EmployeeRepository;
import com.everx.hr.payroll.dto.EmployeeCompensationDto;
import com.everx.hr.payroll.dto.EmployeePayrollComponentDto;
import com.everx.hr.payroll.dto.PayrollCtcBreakdownDto;
import com.everx.hr.payroll.dto.PayrollCtcLineDto;
import com.everx.hr.payroll.dto.UpsertEmployeeCompensationRequest;
import com.everx.hr.payroll.dto.UpsertEmployeePayrollComponentRequest;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeCompensationService {

    private static final BigDecimal MONTHS_IN_YEAR = BigDecimal.valueOf(12);

    private final EmployeeCompensationRepository employeeCompensationRepository;
    private final EmployeePayrollComponentRepository employeePayrollComponentRepository;
    private final PayrollComponentRepository payrollComponentRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public EmployeeCompensationDto upsertCompensation(UpsertEmployeeCompensationRequest request) {
        validateEmployee(request.getEmployeeId());
        if (request.getAnnualCtc() == null || request.getAnnualCtc().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("Annual CTC must be greater than zero");
        }

        EmployeeCompensation compensation = employeeCompensationRepository
                .findByEmployeeIdAndIsDeletedFalse(request.getEmployeeId())
                .orElseGet(EmployeeCompensation::new);

        compensation.setEmployeeId(request.getEmployeeId());
        compensation.setAnnualCtc(request.getAnnualCtc());
        compensation.setCurrency(request.getCurrency());
        compensation.setEffectiveFrom(request.getEffectiveFrom());
        compensation.setEffectiveTo(request.getEffectiveTo());

        return toDto(employeeCompensationRepository.save(compensation));
    }

    @Transactional(readOnly = true)
    public EmployeeCompensationDto getCompensation(UUID employeeId) {
        EmployeeCompensation compensation = employeeCompensationRepository
                .findByEmployeeIdAndIsDeletedFalse(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Compensation not found for employee: " + employeeId));
        return toDto(compensation);
    }

    @Transactional
    public List<EmployeePayrollComponentDto> upsertComponents(UUID employeeId, List<UpsertEmployeePayrollComponentRequest> requests) {
        validateEmployee(employeeId);

        List<EmployeePayrollComponentDto> results = new ArrayList<>();
        Map<UUID, PayrollComponent> componentMap = payrollComponentRepository.findAll().stream()
                .filter(component -> !Boolean.TRUE.equals(component.getIsDeleted()))
                .collect(Collectors.toMap(PayrollComponent::getId, component -> component));

        for (UpsertEmployeePayrollComponentRequest request : requests) {
            PayrollComponent component = componentMap.get(request.getComponentId());
            if (component == null) {
                throw new EntityNotFoundException("Payroll component not found with id: " + request.getComponentId());
            }

            EmployeePayrollComponent assignment = employeePayrollComponentRepository
                    .findByEmployeeIdAndComponentIdAndIsDeletedFalse(employeeId, request.getComponentId())
                    .orElseGet(EmployeePayrollComponent::new);

            assignment.setEmployeeId(employeeId);
            assignment.setComponentId(request.getComponentId());
            assignment.setAmount(request.getAmount());
            assignment.setPercentage(request.getPercentage());
            if (request.getIsActive() != null) {
                assignment.setIsActive(request.getIsActive());
            }

            results.add(toDto(employeePayrollComponentRepository.save(assignment)));
        }

        return results;
    }

    @Transactional(readOnly = true)
    public List<EmployeePayrollComponentDto> getComponents(UUID employeeId) {
        return employeePayrollComponentRepository.findByEmployeeIdAndIsDeletedFalse(employeeId)
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public PayrollCtcBreakdownDto getBreakdown(UUID employeeId) {
        EmployeeCompensation compensation = employeeCompensationRepository
                .findByEmployeeIdAndIsDeletedFalse(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Compensation not found for employee: " + employeeId));

        BigDecimal annualCtc = compensation.getAnnualCtc();
        BigDecimal monthlyCtc = divide(annualCtc, MONTHS_IN_YEAR);

        List<EmployeePayrollComponent> assignments = employeePayrollComponentRepository
                .findByEmployeeIdAndIsDeletedFalse(employeeId)
                .stream()
                .filter(a -> Boolean.TRUE.equals(a.getIsActive()))
                .toList();

        List<PayrollCtcLineDto> lines = new ArrayList<>();
        BigDecimal totalEarnings = BigDecimal.ZERO;
        BigDecimal totalDeductions = BigDecimal.ZERO;

        if (assignments.isEmpty()) {
            PayrollCtcLineDto line = new PayrollCtcLineDto();
            line.setComponentId(null);
            line.setCode("CTC");
            line.setName("CTC Base");
            line.setComponentType(PayrollComponentType.EARNING);
            line.setCalculationType(PayrollCalculationType.FIXED);
            line.setAnnualAmount(annualCtc);
            line.setMonthlyAmount(monthlyCtc);
            line.setPercentageUsed(BigDecimal.valueOf(100));
            lines.add(line);
            totalEarnings = monthlyCtc;
        } else {
            Map<UUID, PayrollComponent> componentMap = payrollComponentRepository.findAll().stream()
                    .filter(component -> !Boolean.TRUE.equals(component.getIsDeleted()))
                    .collect(Collectors.toMap(PayrollComponent::getId, component -> component));

            for (EmployeePayrollComponent assignment : assignments) {
                PayrollComponent component = componentMap.get(assignment.getComponentId());
                if (component == null) {
                    continue;
                }

                BigDecimal annualAmount = resolveAnnualAmount(component, assignment, annualCtc);
                BigDecimal monthlyAmount = divide(annualAmount, MONTHS_IN_YEAR);

                PayrollCtcLineDto line = new PayrollCtcLineDto();
                line.setComponentId(component.getId());
                line.setCode(component.getCode());
                line.setName(component.getName());
                line.setComponentType(component.getComponentType());
                line.setCalculationType(component.getCalculationType());
                line.setAnnualAmount(annualAmount);
                line.setMonthlyAmount(monthlyAmount);
                line.setPercentageUsed(resolvePercentage(component, assignment));
                lines.add(line);

                if (component.getComponentType() == PayrollComponentType.EARNING) {
                    totalEarnings = totalEarnings.add(monthlyAmount);
                } else {
                    totalDeductions = totalDeductions.add(monthlyAmount);
                }
            }
        }

        PayrollCtcBreakdownDto dto = new PayrollCtcBreakdownDto();
        dto.setEmployeeId(employeeId);
        dto.setAnnualCtc(annualCtc);
        dto.setMonthlyCtc(monthlyCtc);
        dto.setCurrency(compensation.getCurrency());
        dto.setTotalEarningsMonthly(totalEarnings);
        dto.setTotalDeductionsMonthly(totalDeductions);
        dto.setItems(lines);
        return dto;
    }

    private void validateEmployee(UUID employeeId) {
        employeeRepository.findByIdAndNotDeleted(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));
    }

    private BigDecimal resolveAnnualAmount(PayrollComponent component, EmployeePayrollComponent assignment, BigDecimal annualCtc) {
        if (component.getCalculationType() == PayrollCalculationType.PERCENTAGE) {
            BigDecimal percent = assignment.getPercentage() != null ? assignment.getPercentage() : component.getDefaultPercentage();
            if (percent == null) {
                return BigDecimal.ZERO;
            }
            return annualCtc.multiply(percent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }

        BigDecimal amount = assignment.getAmount() != null ? assignment.getAmount() : component.getDefaultAmount();
        return amount != null ? amount : BigDecimal.ZERO;
    }

    private BigDecimal resolvePercentage(PayrollComponent component, EmployeePayrollComponent assignment) {
        if (component.getCalculationType() == PayrollCalculationType.PERCENTAGE) {
            BigDecimal percent = assignment.getPercentage() != null ? assignment.getPercentage() : component.getDefaultPercentage();
            return percent != null ? percent : BigDecimal.ZERO;
        }
        return BigDecimal.ZERO;
    }

    private BigDecimal divide(BigDecimal numerator, BigDecimal denominator) {
        if (denominator == null || denominator.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return numerator.divide(denominator, 2, RoundingMode.HALF_UP);
    }

    private EmployeeCompensationDto toDto(EmployeeCompensation compensation) {
        EmployeeCompensationDto dto = new EmployeeCompensationDto();
        dto.setId(compensation.getId());
        dto.setEmployeeId(compensation.getEmployeeId());
        dto.setAnnualCtc(compensation.getAnnualCtc());
        dto.setCurrency(compensation.getCurrency());
        dto.setEffectiveFrom(compensation.getEffectiveFrom());
        dto.setEffectiveTo(compensation.getEffectiveTo());
        if (compensation.getCreatedAt() != null) {
            dto.setCreatedAt(compensation.getCreatedAt().toInstant());
        }
        if (compensation.getUpdatedAt() != null) {
            dto.setUpdatedAt(compensation.getUpdatedAt().toInstant());
        }
        return dto;
    }

    private EmployeePayrollComponentDto toDto(EmployeePayrollComponent assignment) {
        EmployeePayrollComponentDto dto = new EmployeePayrollComponentDto();
        dto.setId(assignment.getId());
        dto.setEmployeeId(assignment.getEmployeeId());
        dto.setComponentId(assignment.getComponentId());
        dto.setAmount(assignment.getAmount());
        dto.setPercentage(assignment.getPercentage());
        dto.setIsActive(assignment.getIsActive());
        if (assignment.getCreatedAt() != null) {
            dto.setCreatedAt(assignment.getCreatedAt().toInstant());
        }
        if (assignment.getUpdatedAt() != null) {
            dto.setUpdatedAt(assignment.getUpdatedAt().toInstant());
        }
        return dto;
    }
}
