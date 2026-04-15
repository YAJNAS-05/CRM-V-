package com.everx.erp.inventory.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateInventoryItemRequest {

    private String itemCode;
    private String name;
    private String description;
    private String category;
    private String unitOfMeasure;
    private Integer quantity;
    private Integer minStockLevel;
    private Integer maxStockLevel;
    private Integer reorderPoint;
    private BigDecimal unitPrice;
    private String supplierName;
    private String location;
    private String barcode;
    private String sku;
    private String status;
}
