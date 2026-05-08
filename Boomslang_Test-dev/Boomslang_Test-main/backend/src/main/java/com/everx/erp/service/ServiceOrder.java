package com.everx.erp.service;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.util.UUID;

@Entity
@Table(name = "service_order", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ServiceOrder extends BaseEntity {
    @Column(name = "service_number", nullable = false, unique = true)
    private String serviceNumber;
    @Column(name = "customer_id")
    private UUID customerId;
    @Column(name = "equipment_id")
    private UUID equipmentId;
    @Column(name = "service_type", length = 50)
    private String serviceType;
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    @Column(name = "status", length = 20)
    private String status;
    @Column(name = "scheduled_date")
    private java.time.LocalDate scheduledDate;
}
