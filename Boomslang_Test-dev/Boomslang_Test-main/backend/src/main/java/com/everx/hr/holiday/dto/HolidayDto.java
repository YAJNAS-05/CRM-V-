package com.everx.hr.holiday.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HolidayDto {
    private UUID id;
    private LocalDate holidayDate;
    private String name;
    private String region;
    private Boolean optional;
    private String description;
    private Instant createdAt;
    private Instant updatedAt;
}
