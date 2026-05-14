package com.everx.erp.inventory.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
public class CreateInventoryItemRequest {

    @NotBlank
    private String itemCode;

    @NotBlank
    private String name;

    private String description;
    private String category;
    private String unitOfMeasure;

    @NotNull
    private Integer quantity;

    private Integer minStockLevel;
    private Integer maxStockLevel;
    private Integer reorderPoint;
    private BigDecimal unitPrice;
    private String supplierName;
    private String location;
    private String barcode;
    private String sku;

    @NotBlank
    private String status;
}
