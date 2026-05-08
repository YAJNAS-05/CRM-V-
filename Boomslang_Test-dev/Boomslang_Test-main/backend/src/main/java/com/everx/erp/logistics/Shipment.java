package com.everx.erp.logistics;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.util.UUID;

@Entity
@Table(name = "shipment", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Shipment extends BaseEntity {
    @Column(name = "shipment_number", nullable = false, unique = true)
    private String shipmentNumber;
    @Column(name = "order_id")
    private UUID orderId;
    @Column(name = "carrier", length = 100)
    private String carrier;
    @Column(name = "tracking_number", length = 50)
    private String trackingNumber;
    @Column(name = "status", length = 20)
    private String status;
    @Column(name = "ship_date")
    private java.time.LocalDate shipDate;
    @Column(name = "delivery_date")
    private java.time.LocalDate deliveryDate;
}
