package com.everx.erp.inventory;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "inventory_item", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class InventoryItem extends BaseEntity {
    @Column(name = "item_number", nullable = false, unique = true)
    private String itemNumber;
    @Column(name = "description", length = 200)
    private String description;
    @Column(name = "item_group", length = 50)
    private String itemGroup;
    @Column(name = "unit_of_measure", length = 10)
    private String unitOfMeasure;
    @Column(name = "quantity_on_hand")
    private BigDecimal quantityOnHand;
    @Column(name = "standard_cost")
    private BigDecimal standardCost;
    @Column(name = "status", length = 20)
    private String status;
}
