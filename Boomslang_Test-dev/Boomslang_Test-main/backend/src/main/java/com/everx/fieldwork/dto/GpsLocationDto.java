package com.everx.fieldwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GpsLocationDto {
    private UUID id;
    private String technicianId;
    private String fieldJobId;
    private Double latitude;
    private Double longitude;
    private Double altitude;
    private Double accuracy;
    private Double speed;
    private Double heading;
    private LocalDateTime timestamp;
    private String address;
    private String city;
    private String state;
    private String country;
    private String postalCode;
    private String source;
    private Boolean isAccurate;
    private Integer satelliteCount;
    private Double hdop;
    private Double vdop;
    private Integer batteryLevel;
    private Boolean isCharging;
    private String deviceInfo;
    private String appVersion;
    private String context;
    private String notes;
    private Boolean isWaypoint;
    private Integer waypointOrder;
    private Double distanceFromPrevious;
    private LocalDateTime previousLocationTime;
    private Double timeFromPrevious;
    private Boolean isInGeofence;
    private String geofenceId;
    private String geofenceName;
    private Double temperature;
    private Double humidity;
    private String weatherCondition;
    private Double windSpeed;
    private String networkType;
    private String networkProvider;
    private Integer signalStrength;
    private Boolean isSynced;
    private LocalDateTime syncedAt;
    private String syncError;
    private Boolean isActive;
    private Boolean userConsent;
    private LocalDateTime consentExpiry;
    private Boolean isWorkHours;
    private String externalTrackingId;
    private String deviceId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum LocationSource {
        GPS, NETWORK, PASSIVE, MANUAL, BEACON, WIFI, CELL_TOWER, HYBRID
    }

    public enum LocationContext {
        TRAVELING, AT_JOB_SITE, AT_HOME, AT_OFFICE, ON_BREAK, FUELING, 
        PICKING_PARTS, CUSTOMER_SITE, WAREHOUSE, OTHER
    }

    public enum NetworkType {
        NONE, WIFI, MOBILE_2G, MOBILE_3G, MOBILE_4G, MOBILE_5G, 
        ETHERNET, BLUETOOTH, SATELLITE
    }
}
