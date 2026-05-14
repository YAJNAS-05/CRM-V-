package com.everx.erp.inventory.transfer.dto;

import com.everx.erp.inventory.transfer.InventoryTransfer;
import com.everx.erp.inventory.transfer.InventoryTransferStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryTransferDto {

    private UUID id;
    private String transferNumber;
    private UUID itemId;
    private String fromLocation;
    private String toLocation;
    private Integer quantity;
    private InventoryTransferStatus status;
    private String notes;
    private OffsetDateTime postedAt;
    private OffsetDateTime createdAt;

    public static InventoryTransferDto fromEntity(InventoryTransfer transfer) {
        return InventoryTransferDto.builder()
                .id(transfer.getId())
                .transferNumber(transfer.getTransferNumber())
                .itemId(transfer.getItemId())
                .fromLocation(transfer.getFromLocation())
                .toLocation(transfer.getToLocation())
                .quantity(transfer.getQuantity())
                .status(transfer.getStatus())
                .notes(transfer.getNotes())
                .postedAt(transfer.getPostedAt())
                .createdAt(transfer.getCreatedAt())
                .build();
    }
}
