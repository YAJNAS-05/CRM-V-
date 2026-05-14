package com.everx.erp.spareparts.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SparePartDto {
    private UUID id;
    private String partNumber;
    private String name;
    private String description;
    private String category;
    private String[] compatibleModels;
    private Integer stockQty;
    private Integer reorderPoint;
    private BigDecimal unitCost;
    private String currency;
    private UUID supplierId;
    private String warehouseLocation;
    private String manufacturer;
    private String locationCountry;
    private Integer yearOfManufacture;
    private Instant createdAt;
    private Instant updatedAt;
}
