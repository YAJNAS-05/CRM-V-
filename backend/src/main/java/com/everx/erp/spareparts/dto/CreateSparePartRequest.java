package com.everx.erp.spareparts.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSparePartRequest {
    
    @NotBlank(message = "Part number is required")
    @Size(max = 100)
    private String partNumber;

    @NotBlank(message = "Name is required")
    @Size(max = 255)
    private String name;

    private String description;

    @Size(max = 50)
    private String category;

    private String[] compatibleModels;
    private Integer stockQty;
    private Integer reorderPoint;
    private BigDecimal unitCost;

    @Size(max = 3)
    private String currency;

    private UUID supplierId;

    @Size(max = 50)
    private String warehouseLocation;

    private String manufacturer;
    private String locationCountry;
    private Integer yearOfManufacture;
}
