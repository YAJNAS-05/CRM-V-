package com.everx.erp.inventory.dto;

import com.everx.erp.inventory.InventoryItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItemDto {

    private UUID id;
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
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static InventoryItemDto fromEntity(InventoryItem item) {
        return InventoryItemDto.builder()
                .id(item.getId())
                .itemCode(item.getItemCode())
                .name(item.getName())
                .description(item.getDescription())
                .category(item.getCategory())
                .unitOfMeasure(item.getUnitOfMeasure())
                .quantity(item.getCurrentStock())
                .minStockLevel(item.getMinimumStock())
                .maxStockLevel(item.getMaximumStock())
                .reorderPoint(item.getMinimumStock()) // Using minimum stock as reorder point for now
                .unitPrice(item.getSellingPrice())
                .supplierName(null) // Will be populated from supplier service if needed
                .location(item.getLocation())
                .barcode(null) // Not in entity yet
                .sku(null) // Not in entity yet
                .status(item.getStatus())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
