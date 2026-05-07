package com.everx.hr.timesheet;

import com.everx.hr.employee.EmployeeRepository;
import com.everx.hr.timeentry.TimeEntry;
import com.everx.hr.timeentry.TimeEntryRepository;
import com.everx.hr.timesheet.dto.CreateTimesheetRequest;
import com.everx.hr.timesheet.dto.TimesheetDto;
import com.everx.hr.timesheet.dto.UpdateTimesheetRequest;
import com.everx.platform.config.service.OptionSetService;
import com.everx.platform.config.service.WorkflowEngineService;
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

    private static final String MODULE_HR = "HR";
    private static final String ENTITY_TIMESHEET = "TIMESHEET";
    private static final String FIELD_STATUS = "status";
    private static final String STATUS_DRAFT = "DRAFT";
    private static final String STATUS_SUBMITTED = "SUBMITTED";
    private static final String STATUS_APPROVED = "APPROVED";
    private static final String STATUS_REJECTED = "REJECTED";

    private final TimesheetRepository timesheetRepository;
    private final EmployeeRepository employeeRepository;
    private final TimeEntryRepository timeEntryRepository;
    private final WorkflowEngineService workflowEngineService;
    private final OptionSetService optionSetService;

    @Transactional
    public TimesheetDto createTimesheet(CreateTimesheetRequest request) {
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
        timesheet.setStatus(resolveDefaultStatus());

        return toDto(timesheetRepository.save(timesheet));
    }

    @Transactional(readOnly = true)
    public TimesheetDto getTimesheetById(UUID id) {
        Timesheet timesheet = timesheetRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Timesheet not found with id: " + id));
        return toDto(timesheet);
    }

    @Transactional(readOnly = true)
    public Page<TimesheetDto> getTimesheets(Pageable pageable,
                                            UUID employeeId,
                                            String status,
                                            LocalDate startDate,
                                            LocalDate endDate) {
        return timesheetRepository.findAllFiltered(employeeId, status, startDate, endDate, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<TimesheetDto> getTimesheetsByEmployee(UUID employeeId) {
        return timesheetRepository.findByEmployeeIdAndIsDeletedFalse(employeeId).stream().map(this::toDto).toList();
    }

    @Transactional
    public TimesheetDto updateTimesheet(UUID id, UpdateTimesheetRequest request) {
        Timesheet timesheet = timesheetRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Timesheet not found with id: " + id));

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
        String requestedStatus = normalizeValue(request.getStatus());
        if (requestedStatus != null) {
            validateStatus(requestedStatus);
            timesheet.setStatus(requestedStatus);
        }

        return toDto(timesheetRepository.save(timesheet));
    }

    @Transactional
    public TimesheetDto submitTimesheet(UUID id) {
        Timesheet timesheet = timesheetRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Timesheet not found with id: " + id));
        if (!STATUS_DRAFT.equalsIgnoreCase(timesheet.getStatus())) {
            throw new ValidationException("Only DRAFT timesheets can be submitted");
        }

        if (workflowEngineService.hasWorkflow(MODULE_HR, ENTITY_TIMESHEET)) {
            boolean transitionDefined = workflowEngineService
                    .findTransition(MODULE_HR, ENTITY_TIMESHEET, timesheet.getStatus(), STATUS_SUBMITTED)
                    .isPresent();
            if (!transitionDefined) {
                throw new ValidationException("Transition not allowed by workflow");
            }
            workflowEngineService.enforceTransition(
                    MODULE_HR,
                    ENTITY_TIMESHEET,
                    id.toString(),
                    timesheet.getStatus(),
                    STATUS_SUBMITTED);
        }

        timesheet.setStatus(STATUS_SUBMITTED);
        return toDto(timesheetRepository.save(timesheet));
    }

    @Transactional
    public TimesheetDto approveTimesheet(UUID id, UUID approvedBy) {
        Timesheet timesheet = timesheetRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Timesheet not found with id: " + id));
        if (!STATUS_SUBMITTED.equalsIgnoreCase(timesheet.getStatus())) {
            throw new ValidationException("Only SUBMITTED timesheets can be approved");
        }

        if (workflowEngineService.hasWorkflow(MODULE_HR, ENTITY_TIMESHEET)) {
            boolean transitionDefined = workflowEngineService
                    .findTransition(MODULE_HR, ENTITY_TIMESHEET, timesheet.getStatus(), STATUS_APPROVED)
                    .isPresent();
            if (!transitionDefined) {
                throw new ValidationException("Transition not allowed by workflow");
            }
            workflowEngineService.enforceTransition(
                    MODULE_HR,
                    ENTITY_TIMESHEET,
                    id.toString(),
                    timesheet.getStatus(),
                    STATUS_APPROVED);
        }

        timesheet.setStatus(STATUS_APPROVED);
        timesheet.setApprovedBy(approvedBy);
        timesheet.setApprovedAt(OffsetDateTime.now());
        return toDto(timesheetRepository.save(timesheet));
    }

    @Transactional
    public TimesheetDto rejectTimesheet(UUID id, String notes) {
        Timesheet timesheet = timesheetRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Timesheet not found with id: " + id));
        if (!STATUS_SUBMITTED.equalsIgnoreCase(timesheet.getStatus())) {
            throw new ValidationException("Only SUBMITTED timesheets can be rejected");
        }

        if (workflowEngineService.hasWorkflow(MODULE_HR, ENTITY_TIMESHEET)) {
            boolean transitionDefined = workflowEngineService
                    .findTransition(MODULE_HR, ENTITY_TIMESHEET, timesheet.getStatus(), STATUS_REJECTED)
                    .isPresent();
            if (!transitionDefined) {
                throw new ValidationException("Transition not allowed by workflow");
            }
            workflowEngineService.enforceTransition(
                    MODULE_HR,
                    ENTITY_TIMESHEET,
                    id.toString(),
                    timesheet.getStatus(),
                    STATUS_REJECTED);
        }

        timesheet.setStatus(STATUS_REJECTED);
        if (notes != null) {
            timesheet.setNotes(notes);
        }
        return toDto(timesheetRepository.save(timesheet));
    }

    @Transactional
    public Timesheet getOrCreateDailyTimesheet(UUID employeeId, LocalDate workDate) {
        return timesheetRepository.findByEmployeeIdAndWorkDateAndIsDeletedFalse(employeeId, workDate)
                .orElseGet(() -> {
                    Timesheet timesheet = new Timesheet();
                    timesheet.setEmployeeId(employeeId);
                    timesheet.setWorkDate(workDate);
                    timesheet.setWeekStartDate(resolveWeekStart(workDate));
                    timesheet.setStatus(resolveDefaultStatus());
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

    private void validateStatus(String status) {
        if (!optionSetService.isValidOptionValue(MODULE_HR, ENTITY_TIMESHEET, FIELD_STATUS, status)) {
            throw new ValidationException("Timesheet status is not configured");
        }
    }

    private String resolveDefaultStatus() {
        return optionSetService.resolveDefaultValue(MODULE_HR, ENTITY_TIMESHEET, FIELD_STATUS, STATUS_DRAFT);
    }

    private String normalizeValue(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
