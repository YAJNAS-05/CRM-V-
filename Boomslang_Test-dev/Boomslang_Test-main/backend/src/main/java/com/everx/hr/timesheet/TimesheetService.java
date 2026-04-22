package com.everx.hr.timesheet;

import com.everx.hr.TimesheetStatus;
import com.everx.hr.employee.EmployeeRepository;
import com.everx.hr.timesheet.dto.CreateTimesheetRequest;
import com.everx.hr.timesheet.dto.TimesheetDto;
import com.everx.hr.timesheet.dto.UpdateTimesheetRequest;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TimesheetService {

    private final TimesheetRepository timesheetRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public TimesheetDto createTimesheet(CreateTimesheetRequest request) {
        employeeRepository.findByIdAndNotDeleted(request.getEmployeeId())
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + request.getEmployeeId()));

        Timesheet timesheet = new Timesheet();
        timesheet.setEmployeeId(request.getEmployeeId());
        timesheet.setFieldJobId(request.getFieldJobId());
        timesheet.setWorkDate(request.getWorkDate());
        timesheet.setHoursWorked(request.getHoursWorked());
        timesheet.setNotes(request.getNotes());
        timesheet.setStatus(TimesheetStatus.DRAFT);

        return toDto(timesheetRepository.save(timesheet));
    }

    @Transactional(readOnly = true)
    public TimesheetDto getTimesheetById(UUID id) {
        Timesheet timesheet = timesheetRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Timesheet not found with id: " + id));
        return toDto(timesheet);
    }

    @Transactional(readOnly = true)
    public Page<TimesheetDto> getTimesheets(Pageable pageable) {
        return timesheetRepository.findAll(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<TimesheetDto> getTimesheetsByEmployee(UUID employeeId) {
        return timesheetRepository.findByEmployeeId(employeeId).stream().map(this::toDto).toList();
    }

    @Transactional
    public TimesheetDto updateTimesheet(UUID id, UpdateTimesheetRequest request) {
        Timesheet timesheet = timesheetRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Timesheet not found with id: " + id));

        if (request.getFieldJobId() != null) timesheet.setFieldJobId(request.getFieldJobId());
        if (request.getWorkDate() != null) timesheet.setWorkDate(request.getWorkDate());
        if (request.getHoursWorked() != null) timesheet.setHoursWorked(request.getHoursWorked());
        if (request.getNotes() != null) timesheet.setNotes(request.getNotes());
        if (request.getStatus() != null) timesheet.setStatus(request.getStatus());

        return toDto(timesheetRepository.save(timesheet));
    }

    @Transactional
    public TimesheetDto submitTimesheet(UUID id) {
        Timesheet timesheet = timesheetRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Timesheet not found with id: " + id));
        timesheet.setStatus(TimesheetStatus.SUBMITTED);
        return toDto(timesheetRepository.save(timesheet));
    }

    @Transactional
    public TimesheetDto approveTimesheet(UUID id, UUID approvedBy) {
        Timesheet timesheet = timesheetRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Timesheet not found with id: " + id));
        timesheet.setStatus(TimesheetStatus.APPROVED);
        timesheet.setApprovedBy(approvedBy);
        timesheet.setApprovedAt(OffsetDateTime.now());
        return toDto(timesheetRepository.save(timesheet));
    }

    private TimesheetDto toDto(Timesheet timesheet) {
        TimesheetDto dto = new TimesheetDto();
        dto.setId(timesheet.getId());
        dto.setEmployeeId(timesheet.getEmployeeId());
        dto.setFieldJobId(timesheet.getFieldJobId());
        dto.setWorkDate(timesheet.getWorkDate());
        dto.setHoursWorked(timesheet.getHoursWorked());
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
}
