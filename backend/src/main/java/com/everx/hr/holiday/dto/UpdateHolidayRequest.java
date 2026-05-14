package com.everx.hr.holiday.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateHolidayRequest {
    private LocalDate holidayDate;
    private String name;
    private String region;
    private Boolean optional;
    private String description;
}
