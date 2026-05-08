package com.everx.erp.fieldwork.gps.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GpsTrackingPoint {
    private UUID id;
    private UUID employeeId;
    private UUID fieldJobId;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal altitude;
    private BigDecimal accuracy;
    private BigDecimal speed;
    private BigDecimal heading;
    private OffsetDateTime timestamp;
    private String locationSource;
    private Integer batteryLevel;
    private Boolean isActive;
    private String address;
}
