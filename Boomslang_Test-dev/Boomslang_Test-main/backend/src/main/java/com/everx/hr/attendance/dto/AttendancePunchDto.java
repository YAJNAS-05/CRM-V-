package com.everx.hr.attendance.dto;

import com.everx.hr.attendance.AttendancePunch;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Value
@Builder
public class AttendancePunchDto {
    UUID id;
    UUID employeeId;
    OffsetDateTime punchIn;
    OffsetDateTime punchOut;
    LocalDate workDate;
    BigDecimal totalHours;
    String notes;
    OffsetDateTime createdAt;

    public static AttendancePunchDto fromEntity(AttendancePunch punch) {
        return AttendancePunchDto.builder()
                .id(punch.getId())
                .employeeId(punch.getEmployeeId())
                .punchIn(punch.getPunchIn())
                .punchOut(punch.getPunchOut())
                .workDate(punch.getWorkDate())
                .totalHours(punch.getTotalHours())
                .notes(punch.getNotes())
                .createdAt(punch.getCreatedAt())
                .build();
    }
}

