package com.everx.hr.timeentry.dto;

import com.everx.hr.timeentry.TimeEntry;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeEntryDto {

    private UUID id;
    private UUID employeeId;
    private UUID taskId;
    private UUID projectId;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private Integer durationMinutes;
    private LocalDate workDate;
    private String description;
    private Boolean billable;
    private BigDecimal ratePerHour;
    private UUID timesheetId;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static TimeEntryDto fromEntity(TimeEntry entry) {
        return TimeEntryDto.builder()
                .id(entry.getId())
                .employeeId(entry.getEmployeeId())
                .taskId(entry.getTaskId())
                .projectId(entry.getProjectId())
                .startTime(entry.getStartTime())
                .endTime(entry.getEndTime())
                .durationMinutes(entry.getDurationMinutes())
                .workDate(entry.getWorkDate())
                .description(entry.getDescription())
                .billable(entry.getBillable())
                .ratePerHour(entry.getRatePerHour())
                .timesheetId(entry.getTimesheetId())
                .createdAt(entry.getCreatedAt())
                .updatedAt(entry.getUpdatedAt())
                .build();
    }
}
