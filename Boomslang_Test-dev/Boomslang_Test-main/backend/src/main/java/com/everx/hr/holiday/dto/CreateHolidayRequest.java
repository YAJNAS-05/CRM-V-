package com.everx.hr.holiday.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateHolidayRequest {
    @NotNull(message = "Holiday date is required")
    private LocalDate holidayDate;

    @NotBlank(message = "Holiday name is required")
    private String name;

    private String region;
    private Boolean optional;
    private String description;
}
