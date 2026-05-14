package com.everx.hr.timeentry;

import com.everx.hr.employee.EmployeeRepository;
import com.everx.hr.timesheet.Timesheet;
import com.everx.hr.timesheet.TimesheetService;
import com.everx.hr.timeentry.dto.StartTimerRequest;
import com.everx.hr.timeentry.dto.TimeEntryDto;
import com.everx.hr.timeentry.dto.WeeklyTimeEntriesDto;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import com.everx.shared.util.SecurityUserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TimeEntryService {

    private final TimeEntryRepository timeEntryRepository;
    private final EmployeeRepository employeeRepository;
    private final TimesheetService timesheetService;

    public TimeEntryDto startTimer(StartTimerRequest request) {
        UUID employeeId = resolveCurrentEmployeeId();

        timeEntryRepository.findActiveTimerByEmployeeId(employeeId).ifPresent(active -> {
            if (!active.getProjectId().equals(request.getProjectId())) {
                throw new ValidationException("Timer already running on another project. Stop it first.");
            }
            throw new ValidationException("Timer already running for this project.");
        });

        TimeEntry entry = new TimeEntry();
        entry.setEmployeeId(employeeId);
        entry.setProjectId(request.getProjectId());
        entry.setTaskId(request.getTaskId());
        entry.setStartTime(OffsetDateTime.now());
        entry.setDescription(request.getDescription());
        entry.setBillable(Boolean.TRUE.equals(request.getBillable()));
        entry.setRatePerHour(request.getRatePerHour());
        entry.setWorkDate(LocalDate.now());

        return TimeEntryDto.fromEntity(timeEntryRepository.save(entry));
    }

    public TimeEntryDto stopTimer(UUID timeEntryId) {
        TimeEntry entry = timeEntryRepository.findByIdAndIsDeletedFalse(timeEntryId)
                .orElseThrow(() -> new EntityNotFoundException("Time entry not found with id: " + timeEntryId));

        if (entry.getEndTime() != null) {
            throw new ValidationException("Time entry is already stopped");
        }

        OffsetDateTime endTime = OffsetDateTime.now();
        entry.setEndTime(endTime);
        entry.setWorkDate(endTime.toLocalDate());
        entry.setDurationMinutes((int) Duration.between(entry.getStartTime(), endTime).toMinutes());

        Timesheet timesheet = timesheetService.getOrCreateDailyTimesheet(entry.getEmployeeId(), entry.getWorkDate());
        entry.setTimesheetId(timesheet.getId());

        TimeEntry saved = timeEntryRepository.save(entry);
        timesheetService.recalculateTimesheetTotals(timesheet.getId());

        return TimeEntryDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public WeeklyTimeEntriesDto getWeeklyEntries(LocalDate weekStart) {
        UUID employeeId = resolveCurrentEmployeeId();
        LocalDate weekEnd = weekStart.plusDays(6);

        List<TimeEntryDto> entries = timeEntryRepository
                .findByEmployeeAndWorkDateRange(employeeId, weekStart, weekEnd)
                .stream()
                .map(TimeEntryDto::fromEntity)
                .toList();

        BigDecimal totalHours = entries.stream()
                .map(entry -> entry.getDurationMinutes() != null
                        ? BigDecimal.valueOf(entry.getDurationMinutes())
                            .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return WeeklyTimeEntriesDto.builder()
                .weekStart(weekStart)
                .weekEnd(weekEnd)
                .totalHours(totalHours)
                .entries(entries)
                .build();
    }

    @Transactional(readOnly = true)
    public List<TimeEntryDto> getProjectTimeEntries(UUID projectId) {
        return timeEntryRepository.findByProjectIdAndIsDeletedFalse(projectId)
                .stream()
                .map(TimeEntryDto::fromEntity)
                .toList();
    }

    private UUID resolveCurrentEmployeeId() {
        UUID userId = SecurityUserContext.getCurrentUserIdOrNull();
        if (userId == null) {
            throw new ValidationException("User session not found");
        }

        return employeeRepository.findByUserIdAndNotDeleted(userId)
                .map(employee -> employee.getId())
                .orElseThrow(() -> new ValidationException("Current user is not linked to an employee record"));
    }
}
