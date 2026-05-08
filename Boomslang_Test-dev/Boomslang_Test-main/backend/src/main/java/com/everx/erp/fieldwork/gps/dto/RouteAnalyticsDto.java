package com.everx.erp.fieldwork.gps.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteAnalyticsDto {
    private UUID jobId;
    private UUID employeeId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal totalDistance;
    private BigDecimal averageSpeed;
    private BigDecimal maxSpeed;
    private Long totalDuration;
    private Long travelTime;
    private Long stopTime;
    private Integer totalStops;
    private BigDecimal fuelConsumption;
    private String routeEfficiency;
    private List<RoutePointDto> routePoints;
    private BigDecimal estimatedFuelCost;
    private String trafficConditions;
}
