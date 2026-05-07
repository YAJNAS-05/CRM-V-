package com.everx.hr.payroll;

import com.everx.hr.EmployeeStatus;
import com.everx.hr.PayrollItemStatus;
import com.everx.hr.PayrollRunStatus;
import com.everx.hr.PayType;
import com.everx.hr.employee.Employee;
import com.everx.hr.employee.EmployeeRepository;
import com.everx.hr.payroll.dto.CreatePayrollRunRequest;
import com.everx.hr.payroll.dto.PayrollItemDto;
import com.everx.hr.payroll.dto.PayrollProfileDto;
import com.everx.hr.payroll.dto.PayrollRunDto;
import com.everx.hr.payroll.dto.UpdatePayrollProfileRequest;
import com.everx.hr.timesheet.TimesheetRepository;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollProfileRepository payrollProfileRepository;
    private final PayrollRunRepository payrollRunRepository;
    private final PayrollItemRepository payrollItemRepository;
    private final EmployeeRepository employeeRepository;
    private final TimesheetRepository timesheetRepository;

    @Transactional
    public PayrollProfileDto upsertPayrollProfile(UpdatePayrollProfileRequest request) {
        if (request.getEmployeeId() == null) {
            throw new ValidationException("Employee ID is required for payroll profile");
        }

        employeeRepository.findByIdAndNotDeleted(request.getEmployeeId())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + request.getEmployeeId()));

        PayrollProfile profile = payrollProfileRepository.findByEmployeeId(request.getEmployeeId())
                .orElseGet(PayrollProfile::new);

        profile.setEmployeeId(request.getEmployeeId());
        if (request.getPayType() != null) profile.setPayType(request.getPayType());
        if (request.getPayFrequency() != null) profile.setPayFrequency(request.getPayFrequency());
        if (request.getSalaryAmount() != null) profile.setSalaryAmount(request.getSalaryAmount());
        if (request.getHourlyRate() != null) profile.setHourlyRate(request.getHourlyRate());
        if (request.getCurrency() != null) profile.setCurrency(request.getCurrency());
        if (request.getTaxId() != null) profile.setTaxId(request.getTaxId());
        if (request.getBankAccountMasked() != null) profile.setBankAccountMasked(request.getBankAccountMasked());

        return toDto(payrollProfileRepository.save(profile));
    }

    @Transactional(readOnly = true)
    public PayrollProfileDto getPayrollProfileByEmployee(UUID employeeId) {
        PayrollProfile profile = payrollProfileRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Payroll profile not found for employee: " + employeeId));
        return toDto(profile);
    }

    @Transactional
    public PayrollRunDto createPayrollRun(CreatePayrollRunRequest request) {
        if (request.getPeriodEnd().isBefore(request.getPeriodStart())) {
            throw new ValidationException("Payroll period end date cannot be before start date");
        }

        PayrollRun run = new PayrollRun();
        run.setPeriodStart(request.getPeriodStart());
        run.setPeriodEnd(request.getPeriodEnd());
        run.setStatus(PayrollRunStatus.DRAFT);
        run.setRunDate(LocalDate.now());
        run.setNotes(request.getNotes());

        PayrollRun savedRun = payrollRunRepository.save(run);

        List<Employee> employees = employeeRepository.findByStatus(EmployeeStatus.ACTIVE);
        for (Employee employee : employees) {
            payrollProfileRepository.findByEmployeeId(employee.getId()).ifPresent(profile -> {
                PayrollItem item = new PayrollItem();
                item.setPayrollRunId(savedRun.getId());
                item.setEmployeeId(employee.getId());
                BigDecimal gross = calculateGrossPay(profile, employee, request.getPeriodStart(), request.getPeriodEnd());
                BigDecimal deductions = BigDecimal.ZERO;
                item.setGrossPay(gross);
                item.setDeductions(deductions);
                item.setNetPay(gross.subtract(deductions));
                item.setCurrency(profile.getCurrency() != null ? profile.getCurrency() : "AUD");
                item.setStatus(PayrollItemStatus.PENDING);
                payrollItemRepository.save(item);
            });
        }

        return getPayrollRun(savedRun.getId());
    }

    @Transactional(readOnly = true)
    public PayrollRunDto getPayrollRun(UUID id) {
        PayrollRun run = payrollRunRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Payroll run not found with id: " + id));
        return toRunDto(run, payrollItemRepository.findByPayrollRunId(id));
    }

    @Transactional(readOnly = true)
    public Page<PayrollRunDto> getPayrollRuns(Pageable pageable,
                                              PayrollRunStatus status,
                                              LocalDate startDate,
                                              LocalDate endDate) {
        return payrollRunRepository.findAllFiltered(status, startDate, endDate, pageable)
                .map(run -> toRunDto(run, payrollItemRepository.findByPayrollRunId(run.getId())));
    }

    @Transactional
    public PayrollRunDto approvePayrollRun(UUID id) {
        PayrollRun run = payrollRunRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Payroll run not found with id: " + id));
        run.setStatus(PayrollRunStatus.APPROVED);
        payrollRunRepository.save(run);
        return getPayrollRun(id);
    }

    @Transactional
    public PayrollRunDto markPayrollRunPaid(UUID id) {
        PayrollRun run = payrollRunRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Payroll run not found with id: " + id));
        run.setStatus(PayrollRunStatus.PAID);
        payrollRunRepository.save(run);

        List<PayrollItem> items = payrollItemRepository.findByPayrollRunId(id);
        for (PayrollItem item : items) {
            item.setStatus(PayrollItemStatus.PAID);
            item.setPaidDate(LocalDate.now());
            payrollItemRepository.save(item);
        }

        return getPayrollRun(id);
    }

    private BigDecimal calculateGrossPay(PayrollProfile profile, Employee employee, LocalDate start, LocalDate end) {
        if (profile.getPayType() == PayType.HOURLY) {
            BigDecimal hours = timesheetRepository.sumHoursForEmployee(employee.getId(), "APPROVED", start, end);
            BigDecimal rate = profile.getHourlyRate() != null ? profile.getHourlyRate() : BigDecimal.ZERO;
            return rate.multiply(hours);
        }

        return profile.getSalaryAmount() != null ? profile.getSalaryAmount() : BigDecimal.ZERO;
    }

    private PayrollProfileDto toDto(PayrollProfile profile) {
        PayrollProfileDto dto = new PayrollProfileDto();
        dto.setId(profile.getId());
        dto.setEmployeeId(profile.getEmployeeId());
        dto.setPayType(profile.getPayType());
        dto.setPayFrequency(profile.getPayFrequency());
        dto.setSalaryAmount(profile.getSalaryAmount());
        dto.setHourlyRate(profile.getHourlyRate());
        dto.setCurrency(profile.getCurrency());
        dto.setTaxId(profile.getTaxId());
        dto.setBankAccountMasked(profile.getBankAccountMasked());
        if (profile.getCreatedAt() != null) {
            dto.setCreatedAt(profile.getCreatedAt().toInstant());
        }
        if (profile.getUpdatedAt() != null) {
            dto.setUpdatedAt(profile.getUpdatedAt().toInstant());
        }
        return dto;
    }

    private PayrollRunDto toRunDto(PayrollRun run, List<PayrollItem> items) {
        PayrollRunDto dto = new PayrollRunDto();
        dto.setId(run.getId());
        dto.setPeriodStart(run.getPeriodStart());
        dto.setPeriodEnd(run.getPeriodEnd());
        dto.setStatus(run.getStatus());
        dto.setRunDate(run.getRunDate());
        dto.setNotes(run.getNotes());
        dto.setItems(items.stream().map(this::toItemDto).collect(Collectors.toList()));
        if (run.getCreatedAt() != null) {
            dto.setCreatedAt(run.getCreatedAt().toInstant());
        }
        if (run.getUpdatedAt() != null) {
            dto.setUpdatedAt(run.getUpdatedAt().toInstant());
        }
        return dto;
    }

    private PayrollItemDto toItemDto(PayrollItem item) {
        PayrollItemDto dto = new PayrollItemDto();
        dto.setId(item.getId());
        dto.setPayrollRunId(item.getPayrollRunId());
        dto.setEmployeeId(item.getEmployeeId());
        dto.setGrossPay(item.getGrossPay());
        dto.setDeductions(item.getDeductions());
        dto.setNetPay(item.getNetPay());
        dto.setCurrency(item.getCurrency());
        dto.setStatus(item.getStatus());
        dto.setPaidDate(item.getPaidDate());
        if (item.getCreatedAt() != null) {
            dto.setCreatedAt(item.getCreatedAt().toInstant());
        }
        if (item.getUpdatedAt() != null) {
            dto.setUpdatedAt(item.getUpdatedAt().toInstant());
        }
        return dto;
    }
}
