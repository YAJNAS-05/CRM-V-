package com.everx.erp.spareparts;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "spare_parts", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SparePart extends BaseEntity {

    @Column(name = "part_number", unique = true, nullable = false, length = 100)
    private String partNumber;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String category;

    @Column(name = "compatible_models", columnDefinition = "TEXT ARRAY")
    private String[] compatibleModels;

    @Column(name = "stock_qty")
    private Integer stockQty = 0;

    @Column(name = "reorder_point")
    private Integer reorderPoint;

    @Column(name = "unit_cost", precision = 15, scale = 2)
    private BigDecimal unitCost;

    @Column(length = 3)
    private String currency;

    @Column(name = "supplier_id")
    private UUID supplierId;

    @Column(name = "warehouse_location", length = 50)
    private String warehouseLocation;

    @Column(length = 100)
    private String manufacturer;

    @Column(name = "location_country", length = 100)
    private String locationCountry;

    @Column(name = "year_of_manufacture")
    private Integer yearOfManufacture;
}
