package com.everx.erp.fieldwork.gps.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GpsTrackingPointDto {
    private UUID id;
    private UUID employeeId;
    private UUID fieldJobId;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal altitude;
    private BigDecimal accuracy;
    private BigDecimal speed;
    private BigDecimal heading;
    private LocalDateTime timestamp;
    private String locationSource;
    private Integer batteryLevel;
    private Boolean isActive;
    private String address;
}
