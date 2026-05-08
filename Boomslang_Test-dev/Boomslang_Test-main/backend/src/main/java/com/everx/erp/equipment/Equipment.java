package com.everx.erp.equipment;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "equipment", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Equipment extends BaseEntity {
    @Column(name = "equipment_number", nullable = false, unique = true)
    private String equipmentNumber;
    @Column(name = "equipment_type", length = 50)
    private String equipmentType;
    @Column(name = "description", length = 200)
    private String description;
    @Column(name = "serial_number", length = 50)
    private String serialNumber;
    @Column(name = "status", length = 20)
    private String status;
    @Column(name = "location_id")
    private UUID locationId;
    @Column(name = "purchase_date")
    private java.time.LocalDate purchaseDate;
    @Column(name = "purchase_cost")
    private BigDecimal purchaseCost;
}
