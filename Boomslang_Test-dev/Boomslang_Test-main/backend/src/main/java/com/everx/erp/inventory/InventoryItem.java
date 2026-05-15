package com.everx.erp.inventory;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "inventory_items", schema = "everx_erp")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem extends BaseEntity {

    @Column(name = "item_code", nullable = false, unique = true)
    private String itemCode;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category")
    private String category;

    @Column(name = "unit_of_measure")
    private String unitOfMeasure;

    @Column(name = "current_stock", nullable = false)
    private Integer currentStock;

    @Column(name = "minimum_stock")
    private Integer minimumStock;

    @Column(name = "maximum_stock")
    private Integer maximumStock;

    @Column(name = "unit_cost")
    private BigDecimal unitCost;

    @Column(name = "selling_price")
    private BigDecimal sellingPrice;

    @Column(name = "supplier_id")
    private java.util.UUID supplierId;

    @Column(name = "location")
    private String location;

    @Column(name = "status", nullable = false)
    private String status;
}
