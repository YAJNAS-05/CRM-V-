package com.everx.erp.inventory.bin.dto;

import com.everx.erp.inventory.bin.InventoryBin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryBinDto {

    private UUID id;
    private UUID itemId;
    private String location;
    private Integer onHand;
    private Integer reserved;
    private Integer available;
    private Integer reorderPoint;
    private Integer minStock;
    private Integer maxStock;

    public static InventoryBinDto fromEntity(InventoryBin bin) {
        int onHand = bin.getOnHand() != null ? bin.getOnHand() : 0;
        int reserved = bin.getReserved() != null ? bin.getReserved() : 0;
        return InventoryBinDto.builder()
                .id(bin.getId())
                .itemId(bin.getItemId())
                .location(bin.getLocation())
                .onHand(onHand)
                .reserved(reserved)
                .available(onHand - reserved)
                .reorderPoint(bin.getReorderPoint())
                .minStock(bin.getMinStock())
                .maxStock(bin.getMaxStock())
                .build();
    }
}
