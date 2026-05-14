package com.everx.erp.purchaseorder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePurchaseOrderItemRequest {
    
    private UUID equipmentId;
    private UUID sparePartId;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Quantity is required")
    private Integer quantity;

    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
}
