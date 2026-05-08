package com.everx.erp.spareparts;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.math.BigDecimal;

@Entity
@Table(name = "spare_part", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SparePart extends BaseEntity {
    @Column(name = "part_number", nullable = false, unique = true)
    private String partNumber;
    @Column(name = "description", length = 200)
    private String description;
    @Column(name = "compatible_equipment_type", length = 50)
    private String compatibleEquipmentType;
    @Column(name = "unit_price")
    private BigDecimal unitPrice;
    @Column(name = "quantity_in_stock")
    private Integer quantityInStock;
}
