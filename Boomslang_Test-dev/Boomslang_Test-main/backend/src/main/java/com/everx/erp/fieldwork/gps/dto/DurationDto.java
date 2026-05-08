package com.everx.erp.fieldwork.gps.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DurationDto {
    private Long hours;
    private Long minutes;
    private Long seconds;
    private Long totalMinutes;
    private Long totalSeconds;
    private String formattedDuration;
}
