package com.everx.erp.inventory.ledger.dto;

import com.everx.erp.inventory.ledger.InventoryLedgerEntry;
import com.everx.erp.inventory.ledger.LedgerEntryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryLedgerEntryDto {

    private UUID id;
    private UUID itemId;
    private String location;
    private Integer quantityChange;
    private Integer balanceAfter;
    private LedgerEntryType entryType;
    private String referenceType;
    private UUID referenceId;
    private BigDecimal unitCost;
    private BigDecimal totalCost;
    private String notes;
    private OffsetDateTime transactionAt;

    public static InventoryLedgerEntryDto fromEntity(InventoryLedgerEntry entry) {
        return InventoryLedgerEntryDto.builder()
                .id(entry.getId())
                .itemId(entry.getItemId())
                .location(entry.getLocation())
                .quantityChange(entry.getQuantityChange())
                .balanceAfter(entry.getBalanceAfter())
                .entryType(entry.getEntryType())
                .referenceType(entry.getReferenceType())
                .referenceId(entry.getReferenceId())
                .unitCost(entry.getUnitCost())
                .totalCost(entry.getTotalCost())
                .notes(entry.getNotes())
                .transactionAt(entry.getTransactionAt())
                .build();
    }
}
