package com.everx.fieldwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GpsLocationStatsDto {
    
    private String technicianId;
    
    private LocalDateTime startDate;
    
    private LocalDateTime endDate;
    
    private int totalLocations;
    
    private double totalDistance; // in kilometers
    
    private double averageSpeed; // in km/h
    
    private double maxSpeed; // in km/h
    
    private int accurateLocations;
    
    private double averageAccuracy; // in meters
}
