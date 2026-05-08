package com.everx.fieldwork.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "gps_locations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class GpsLocation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String technicianId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id", insertable = false, updatable = false)
    private Technician technician;

    @Column
    private String fieldJobId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "field_job_id", insertable = false, updatable = false)
    private FieldJob fieldJob;

    @Column(precision = 10, scale = 6, nullable = false)
    private Double latitude;

    @Column(precision = 10, scale = 6, nullable = false)
    private Double longitude;

    @Column(precision = 10, scale = 2)
    private Double altitude; // in meters

    @Column(precision = 5, scale = 2)
    private Double accuracy; // in meters

    @Column(precision = 5, scale = 2)
    private Double speed; // in km/h

    @Column(precision = 5, scale = 1)
    private Double heading; // in degrees (0-360)

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column
    private String address; // Reverse geocoded address

    @Column
    private String city;

    @Column
    private String state;

    @Column
    private String country;

    @Column
    private String postalCode;

    // Location source and accuracy
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LocationSource source;

    @Column(nullable = false)
    private Boolean isAccurate = true;

    @Column
    private Integer satelliteCount; // for GPS sources

    @Column
    private Double hdop; // Horizontal dilution of precision

    @Column
    private Double vdop; // Vertical dilution of precision

    // Battery and device status
    @Column
    private Integer batteryLevel; // percentage

    @Column(nullable = false)
    private Boolean isCharging = false;

    @Column
    private String deviceInfo;

    @Column
    private String appVersion;

    // Location context
    @Enumerated(EnumType.STRING)
    private LocationContext context;

    @Column
    private String notes;

    @Column
    private Boolean isWaypoint = false;

    @Column
    private Integer waypointOrder;

    // Travel information
    @Column
    private Double distanceFromPrevious; // in meters

    @Column
    private LocalDateTime previousLocationTime;

    @Column
    private Double timeFromPrevious; // in seconds

    // Geofence information
    @Column
    private Boolean isInGeofence = false;

    @Column
    private String geofenceId;

    @Column
    private String geofenceName;

    // Weather information at location
    @Column
    private Double temperature; // in Celsius

    @Column
    private Double humidity; // percentage

    @Column
    private String weatherCondition;

    @Column
    private Double windSpeed; // in km/h

    // Network information
    @Enumerated(EnumType.STRING)
    private NetworkType networkType;

    @Column
    private String networkProvider;

    @Column
    private Integer signalStrength; // in dBm

    // Data synchronization
    @Column(nullable = false)
    private Boolean isSynced = false;

    @Column
    private LocalDateTime syncedAt;

    @Column
    private String syncError;

    @Column(nullable = false)
    private Boolean isActive = true;

    // Privacy and security
    @Column(nullable = false)
    private Boolean userConsent = true;

    @Column
    private LocalDateTime consentExpiry;

    @Column(nullable = false)
    private Boolean isWorkHours = true;

    // Integration fields
    @Column
    private String externalTrackingId;

    @Column
    private String deviceId;

    // Audit fields
    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum LocationSource {
        GPS,
        NETWORK,
        PASSIVE,
        MANUAL,
        BEACON,
        WIFI,
        CELL_TOWER,
        HYBRID
    }

    public enum LocationContext {
        TRAVELING,
        AT_JOB_SITE,
        AT_HOME,
        AT_OFFICE,
        ON_BREAK,
        FUELING,
        PICKING_PARTS,
        CUSTOMER_SITE,
        WAREHOUSE,
        OTHER
    }

    public enum NetworkType {
        NONE,
        WIFI,
        MOBILE_2G,
        MOBILE_3G,
        MOBILE_4G,
        MOBILE_5G,
        ETHERNET,
        BLUETOOTH,
        SATELLITE
    }
}
