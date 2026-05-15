package com.everx.hr.timesheet;

import com.everx.hr.TimesheetStatus;
import com.everx.hr.employee.EmployeeRepository;
import com.everx.hr.security.HrAccessControlService;
import com.everx.hr.timeentry.TimeEntry;
import com.everx.hr.timeentry.TimeEntryRepository;
import com.everx.hr.timesheet.dto.CreateTimesheetRequest;
import com.everx.hr.timesheet.dto.TimesheetDto;
import com.everx.hr.timesheet.dto.UpdateTimesheetRequest;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TimesheetService {

    private final TimesheetRepository timesheetRepository;
    private final EmployeeRepository employeeRepository;
    private final TimeEntryRepository timeEntryRepository;
    private final HrAccessControlService hrAccessControlService;

    @Transactional
    public TimesheetDto createTimesheet(CreateTimesheetRequest request) {
        hrAccessControlService.assertCanAccessEmployee(request.getEmployeeId());
        employeeRepository.findByIdAndNotDeleted(request.getEmployeeId())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + request.getEmployeeId()));

        Timesheet timesheet = new Timesheet();
        timesheet.setEmployeeId(request.getEmployeeId());
        timesheet.setFieldJobId(request.getFieldJobId());
        timesheet.setWorkDate(request.getWorkDate());
        timesheet.setWeekStartDate(resolveWeekStart(request.getWorkDate()));
        timesheet.setHoursWorked(request.getHoursWorked());
        if (request.getHoursWorked() != null) {
            timesheet.setTotalHours(request.getHoursWorked());
            timesheet.setTotalNonBillableHours(request.getHoursWorked());
            timesheet.setTotalBillableHours(BigDecimal.ZERO);
        }
        timesheet.setNotes(request.getNotes());
        timesheet.setStatus(TimesheetStatus.DRAFT);

        return toDto(timesheetRepository.save(timesheet));
    }

    @Transactional(readOnly = true)
    public TimesheetDto getTimesheetById(UUID id) {
        Timesheet timesheet = timesheetRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Timesheet not found with id: " + id));
        hrAccessControlService.assertCanAccessEmployee(timesheet.getEmployeeId());
        return toDto(timesheet);
    }

    @Transactional(readOnly = true)
    public Page<TimesheetDto> getTimesheets(Pageable pageable,
                                            UUID employeeId,
                                            TimesheetStatus status,
                                            LocalDate startDate,
                                            LocalDate endDate) {
        UUID scopedEmployeeId = employeeId;
        if (!hrAccessControlService.hasOrgOrTeamScope()) {
            scopedEmployeeId = hrAccessControlService.requireCurrentEmployeeId();
        } else if (employeeId != null) {
            hrAccessControlService.assertCanAccessEmployee(employeeId);
        }

        return timesheetRepository.findAllFiltered(scopedEmployeeId, status, startDate, endDate, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<TimesheetDto> getTimesheetsByEmployee(UUID employeeId) {
        hrAccessControlService.assertCanAccessEmployee(employeeId);
        return timesheetRepository.findByEmployeeIdAndIsDeletedFalse(employeeId).stream().map(this::toDto).toList();
    }

    @Transactional
    public TimesheetDto updateTimesheet(UUID id, UpdateTimesheetRequest request) {
        Timesheet timesheet = timesheetRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Timesheet not found with id: " + id));
        hrAccessControlService.assertCanAccessEmployee(timesheet.getEmployeeId());

        if (request.getStatus() != null) {
            throw new ValidationException("Use submit/approve/reject endpoints for timesheet status updates");
        }

        if (request.getFieldJobId() != null) timesheet.setFieldJobId(request.getFieldJobId());
        if (request.getWorkDate() != null) {
            timesheet.setWorkDate(request.getWorkDate());
            timesheet.setWeekStartDate(resolveWeekStart(request.getWorkDate()));
        }
        if (request.getHoursWorked() != null) {
            timesheet.setHoursWorked(request.getHoursWorked());
            timesheet.setTotalHours(request.getHoursWorked());
            timesheet.setTotalNonBillableHours(request.getHoursWorked());
            timesheet.setTotalBillableHours(BigDecimal.ZERO);
        }
        if (request.getNotes() != null) timesheet.setNotes(request.getNotes());

        return toDto(timesheetRepository.save(timesheet));
    }

    @Transactional
    public TimesheetDto submitTimesheet(UUID id) {
        Timesheet timesheet = timesheetRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Timesheet not found with id: " + id));
        hrAccessControlService.assertCanAccessEmployee(timesheet.getEmployeeId());
        if (timesheet.getStatus() != TimesheetStatus.DRAFT) {
            throw new ValidationException("Only DRAFT timesheets can be submitted");
        }
        timesheet.setStatus(TimesheetStatus.SUBMITTED);
        return toDto(timesheetRepository.save(timesheet));
    }

    @Transactional
    public TimesheetDto approveTimesheet(UUID id) {
        Timesheet timesheet = timesheetRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Timesheet not found with id: " + id));
        hrAccessControlService.assertCanAccessEmployee(timesheet.getEmployeeId());
        if (timesheet.getStatus() != TimesheetStatus.SUBMITTED) {
            throw new ValidationException("Only SUBMITTED timesheets can be approved");
        }
        UUID approverId = hrAccessControlService.resolveCurrentApproverId();
        timesheet.setStatus(TimesheetStatus.APPROVED);
        timesheet.setApprovedBy(approverId);
        timesheet.setApprovedAt(OffsetDateTime.now());
        return toDto(timesheetRepository.save(timesheet));
    }

    @Transactional
    public TimesheetDto rejectTimesheet(UUID id, String notes) {
        Timesheet timesheet = timesheetRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Timesheet not found with id: " + id));
        hrAccessControlService.assertCanAccessEmployee(timesheet.getEmployeeId());
        if (timesheet.getStatus() != TimesheetStatus.SUBMITTED) {
            throw new ValidationException("Only SUBMITTED timesheets can be rejected");
        }
        timesheet.setStatus(TimesheetStatus.REJECTED);
        if (notes != null) {
            timesheet.setNotes(notes);
        }
        return toDto(timesheetRepository.save(timesheet));
    }

    @Transactional
    public Timesheet getOrCreateDailyTimesheet(UUID employeeId, LocalDate workDate) {
        hrAccessControlService.assertCanAccessEmployee(employeeId);
        return timesheetRepository.findByEmployeeIdAndWorkDateAndIsDeletedFalse(employeeId, workDate)
                .orElseGet(() -> {
                    Timesheet timesheet = new Timesheet();
                    timesheet.setEmployeeId(employeeId);
                    timesheet.setWorkDate(workDate);
                    timesheet.setWeekStartDate(resolveWeekStart(workDate));
                    timesheet.setStatus(TimesheetStatus.DRAFT);
                    return timesheetRepository.save(timesheet);
                });
    }

    @Transactional
    public void recalculateTimesheetTotals(UUID timesheetId) {
        Timesheet timesheet = timesheetRepository.findByIdAndIsDeletedFalse(timesheetId)
                .orElseThrow(() -> new EntityNotFoundException("Timesheet not found with id: " + timesheetId));

        List<TimeEntry> entries = timeEntryRepository.findByTimesheetIdAndIsDeletedFalse(timesheetId);
        BigDecimal billable = BigDecimal.ZERO;
        BigDecimal nonBillable = BigDecimal.ZERO;

        for (TimeEntry entry : entries) {
            if (entry.getDurationMinutes() == null) {
                continue;
            }
            BigDecimal hours = BigDecimal.valueOf(entry.getDurationMinutes())
                    .divide(BigDecimal.valueOf(60), 2, java.math.RoundingMode.HALF_UP);
            if (Boolean.TRUE.equals(entry.getBillable())) {
                billable = billable.add(hours);
            } else {
                nonBillable = nonBillable.add(hours);
            }
        }

        BigDecimal total = billable.add(nonBillable);
        timesheet.setTotalBillableHours(billable);
        timesheet.setTotalNonBillableHours(nonBillable);
        timesheet.setTotalHours(total);
        timesheet.setHoursWorked(total);

        timesheetRepository.save(timesheet);
    }

    private TimesheetDto toDto(Timesheet timesheet) {
        TimesheetDto dto = new TimesheetDto();
        dto.setId(timesheet.getId());
        dto.setEmployeeId(timesheet.getEmployeeId());
        dto.setFieldJobId(timesheet.getFieldJobId());
        dto.setWorkDate(timesheet.getWorkDate());
        dto.setWeekStartDate(timesheet.getWeekStartDate());
        dto.setHoursWorked(timesheet.getHoursWorked());
        dto.setTotalBillableHours(timesheet.getTotalBillableHours());
        dto.setTotalNonBillableHours(timesheet.getTotalNonBillableHours());
        dto.setTotalHours(timesheet.getTotalHours());
        dto.setStatus(timesheet.getStatus());
        dto.setApprovedBy(timesheet.getApprovedBy());
        dto.setApprovedAt(timesheet.getApprovedAt());
        dto.setNotes(timesheet.getNotes());
        if (timesheet.getCreatedAt() != null) {
            dto.setCreatedAt(timesheet.getCreatedAt().toInstant());
        }
        if (timesheet.getUpdatedAt() != null) {
            dto.setUpdatedAt(timesheet.getUpdatedAt().toInstant());
        }
        return dto;
    }

    private LocalDate resolveWeekStart(LocalDate workDate) {
        if (workDate == null) {
            return null;
        }
        return workDate.with(WeekFields.ISO.dayOfWeek(), 1);
    }
}
