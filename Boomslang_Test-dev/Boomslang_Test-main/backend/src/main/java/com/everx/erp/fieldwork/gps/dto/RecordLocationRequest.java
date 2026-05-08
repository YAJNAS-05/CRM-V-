package com.everx.erp.fieldwork.gps.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordLocationRequest {
    @NotNull(message = "Job ID is required")
    private UUID jobId;
    
    @NotNull(message = "Latitude is required")
    private BigDecimal latitude;
    
    @NotNull(message = "Longitude is required")
    private BigDecimal longitude;
    
    private BigDecimal altitude;
    
    private BigDecimal accuracy;
    
    private BigDecimal speed;
    
    private BigDecimal heading;
    
    private String locationSource;
    
    private Integer batteryLevel;
    
    private String address;
}
