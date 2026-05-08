package com.everx.fieldwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FieldJobScheduleDto {
    
    private String technicianId;
    
    private LocalDateTime startDate;
    
    private LocalDateTime endDate;
    
    private List<FieldJobDto> jobs;
    
    private int totalJobs;
}
