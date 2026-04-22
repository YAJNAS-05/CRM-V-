package com.everx.erp.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReorderSuggestionDto {

    private UUID itemId;
    private String itemCode;
    private String name;
    private Integer currentStock;
    private Integer reorderPoint;
    private Integer maxStockLevel;
    private Integer suggestedQuantity;
    private String location;
}
