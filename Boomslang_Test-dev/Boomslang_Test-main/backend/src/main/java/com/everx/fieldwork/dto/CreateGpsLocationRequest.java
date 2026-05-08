package com.everx.fieldwork.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateGpsLocationRequest {
    
    @NotNull(message = "Technician ID is required")
    private String technicianId;
    
    private String fieldJobId;
    
    @NotNull(message = "Latitude is required")
    @Min(value = -90, message = "Latitude must be between -90 and 90")
    @Max(value = 90, message = "Latitude must be between -90 and 90")
    private Double latitude;
    
    @NotNull(message = "Longitude is required")
    @Min(value = -180, message = "Longitude must be between -180 and 180")
    @Max(value = 180, message = "Longitude must be between -180 and 180")
    private Double longitude;
    
    private Double altitude; // in meters
    
    @Min(value = 0, message = "Accuracy must be positive")
    private Double accuracy; // in meters
    
    @Min(value = 0, message = "Speed must be positive")
    private Double speed; // in km/h
    
    @Min(value = 0, message = "Heading must be between 0 and 360")
    @Max(value = 360, message = "Heading must be between 0 and 360")
    private Double heading; // in degrees
    
    @NotNull(message = "Source is required")
    private String source;
    
    private Integer satelliteCount;
    
    private Double hdop; // Horizontal dilution of precision
    
    private Double vdop; // Vertical dilution of precision
    
    @Min(value = 0, message = "Battery level must be between 0 and 100")
    @Max(value = 100, message = "Battery level must be between 0 and 100")
    private Integer batteryLevel; // percentage
    
    private Boolean isCharging = false;
    
    private String deviceInfo;
    
    private String appVersion;
    
    private String networkType;
    
    private String networkProvider;
    
    private Integer signalStrength; // in dBm
    
    private String deviceId;
}
