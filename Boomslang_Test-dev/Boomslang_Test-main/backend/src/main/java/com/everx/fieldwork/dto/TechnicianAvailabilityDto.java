package com.everx.fieldwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechnicianAvailabilityDto {
    
    private String technicianId;
    
    private String technicianName;
    
    private String level;
    
    private String skills;
    
    private int currentJobs;
    
    private boolean isAvailable;
}
