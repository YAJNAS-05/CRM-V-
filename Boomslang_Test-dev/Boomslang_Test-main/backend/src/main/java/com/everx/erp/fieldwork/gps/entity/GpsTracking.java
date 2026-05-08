package com.everx.erp.fieldwork.gps.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "gps_tracking", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class GpsTracking extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "field_job_id")
    private UUID fieldJobId;

    @Column(name = "latitude", nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "altitude")
    private BigDecimal altitude;

    @Column(name = "accuracy")
    private BigDecimal accuracy;

    @Column(name = "speed")
    private BigDecimal speed;

    @Column(name = "heading")
    private BigDecimal heading;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "location_source", length = 50)
    private String locationSource;

    @Column(name = "battery_level")
    private Integer batteryLevel;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "address", length = 500)
    private String address;
}
