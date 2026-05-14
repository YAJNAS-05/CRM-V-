package com.everx.erp.inventory.stock.dto;

import com.everx.erp.inventory.stock.StockAdjustmentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CreateStockAdjustmentRequest {

    @NotNull
    private UUID itemId;

    @NotBlank
    private String location;

    @NotNull
    private Integer quantity;

    private BigDecimal unitCost;

    private String notes;

    @NotNull
    private StockAdjustmentType adjustmentType;
}
