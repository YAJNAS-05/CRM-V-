package com.everx.hr.attendance;

import com.everx.hr.attendance.dto.AttendanceCorrectionRequest;
import com.everx.hr.attendance.dto.AttendancePunchDto;
import com.everx.hr.employee.Employee;
import com.everx.hr.employee.EmployeeRepository;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import com.everx.shared.util.SecurityUserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AttendanceService {

    private final AttendancePunchRepository attendancePunchRepository;
    private final EmployeeRepository employeeRepository;

    private UUID resolveCurrentEmployeeId() {
        UUID userId = SecurityUserContext.getCurrentUserIdOrNull();
        if (userId == null) {
            throw new ValidationException("Not authenticated");
        }
        return employeeRepository.findByUserIdAndNotDeleted(userId)
                .map(Employee::getId)
                .orElseThrow(() -> new ValidationException("Employee profile not linked to the current user"));
    }

    public AttendancePunchDto checkIn(String notes) {
        UUID employeeId = resolveCurrentEmployeeId();

        attendancePunchRepository
                .findTopByEmployeeIdAndIsDeletedFalseAndPunchOutIsNullOrderByPunchInDesc(employeeId)
                .ifPresent((existing) -> {
                    throw new ValidationException("Already checked in");
                });

        OffsetDateTime now = OffsetDateTime.now();
        LocalDate workDate = now.atZoneSameInstant(ZoneId.systemDefault()).toLocalDate();

        AttendancePunch punch = new AttendancePunch();
        punch.setEmployeeId(employeeId);
        punch.setPunchIn(now);
        punch.setWorkDate(workDate);
        punch.setNotes(notes);

        return AttendancePunchDto.fromEntity(attendancePunchRepository.save(punch));
    }

    public AttendancePunchDto checkOut(String notes) {
        UUID employeeId = resolveCurrentEmployeeId();

        AttendancePunch punch = attendancePunchRepository
                .findTopByEmployeeIdAndIsDeletedFalseAndPunchOutIsNullOrderByPunchInDesc(employeeId)
                .orElseThrow(() -> new ValidationException("No active check-in found"));

        OffsetDateTime now = OffsetDateTime.now();
        if (now.isBefore(punch.getPunchIn())) {
            throw new ValidationException("Punch out cannot be before punch in");
        }

        punch.setPunchOut(now);
        if (notes != null && !notes.trim().isEmpty()) {
            String existing = punch.getNotes();
            punch.setNotes(existing == null || existing.isBlank() ? notes : existing + "\n" + notes);
        }

        long minutes = ChronoUnit.MINUTES.between(punch.getPunchIn(), punch.getPunchOut());
        BigDecimal hours = BigDecimal.valueOf(minutes)
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        punch.setTotalHours(hours);

        return AttendancePunchDto.fromEntity(attendancePunchRepository.save(punch));
    }

    @Transactional(readOnly = true)
    public List<AttendancePunchDto> getMyAttendance(LocalDate startDate, LocalDate endDate) {
        UUID employeeId = resolveCurrentEmployeeId();
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusDays(30);
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        return attendancePunchRepository.findForEmployeeBetween(employeeId, start, end)
                .stream()
                .map(AttendancePunchDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AttendancePunchDto> getAttendance(LocalDate startDate, LocalDate endDate, UUID employeeId) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusDays(30);
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        return attendancePunchRepository.findBetween(employeeId, start, end)
                .stream()
                .map(AttendancePunchDto::fromEntity)
                .toList();
    }

    public AttendancePunchDto correctPunch(UUID punchId, AttendanceCorrectionRequest request) {
        AttendancePunch punch = attendancePunchRepository.findById(punchId)
                .filter((p) -> Boolean.FALSE.equals(p.getIsDeleted()))
                .orElseThrow(() -> new EntityNotFoundException("Attendance punch not found"));

        if (request.getPunchOut() != null && request.getPunchOut().isBefore(request.getPunchIn())) {
            throw new ValidationException("Punch out cannot be before punch in");
        }

        punch.setPunchIn(request.getPunchIn());
        punch.setPunchOut(request.getPunchOut());
        punch.setWorkDate(request.getPunchIn().atZoneSameInstant(ZoneId.systemDefault()).toLocalDate());
        punch.setNotes(request.getNotes());

        if (punch.getPunchOut() != null) {
            long minutes = ChronoUnit.MINUTES.between(punch.getPunchIn(), punch.getPunchOut());
            BigDecimal hours = BigDecimal.valueOf(minutes)
                    .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
            punch.setTotalHours(hours);
        } else {
            punch.setTotalHours(null);
        }

        return AttendancePunchDto.fromEntity(attendancePunchRepository.save(punch));
    }
}

