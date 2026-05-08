package com.everx.erp.fieldwork.gps.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoutePointDto {
    private BigDecimal latitude;
    private BigDecimal longitude;
    private LocalDateTime timestamp;
    private BigDecimal speed;
    private BigDecimal heading;
    private String locationType;
    private Long stopDuration;
    private BigDecimal distanceFromPrevious;
}
