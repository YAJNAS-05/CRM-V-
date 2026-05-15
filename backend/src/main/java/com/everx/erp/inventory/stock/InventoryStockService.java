package com.everx.erp.inventory.stock;

import com.everx.erp.inventory.InventoryItem;
import com.everx.erp.inventory.InventoryItemRepository;
import com.everx.erp.inventory.bin.InventoryBin;
import com.everx.erp.inventory.bin.InventoryBinRepository;
import com.everx.erp.inventory.ledger.InventoryLedgerEntry;
import com.everx.erp.inventory.ledger.InventoryLedgerRepository;
import com.everx.erp.inventory.ledger.LedgerEntryType;
import com.everx.erp.inventory.ledger.dto.InventoryLedgerEntryDto;
import com.everx.erp.inventory.stock.dto.CreateStockAdjustmentRequest;
import com.everx.erp.inventory.transfer.InventoryTransfer;
import com.everx.erp.inventory.transfer.InventoryTransferRepository;
import com.everx.erp.inventory.transfer.InventoryTransferStatus;
import com.everx.erp.inventory.transfer.dto.CreateInventoryTransferRequest;
import com.everx.erp.inventory.transfer.dto.InventoryTransferDto;
import com.everx.erp.numbering.DocumentNumberGenerator;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryStockService {

    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryBinRepository inventoryBinRepository;
    private final InventoryLedgerRepository inventoryLedgerRepository;
    private final InventoryTransferRepository inventoryTransferRepository;
    private final DocumentNumberGenerator documentNumberGenerator;

    @Transactional
    public InventoryLedgerEntryDto adjustStock(CreateStockAdjustmentRequest request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new ValidationException("quantity", "Quantity must be greater than zero");
        }
        InventoryItem item = inventoryItemRepository.findById(request.getItemId())
                .orElseThrow(() -> new EntityNotFoundException("Inventory item not found: " + request.getItemId()));

        String location = normalizeLocation(request.getLocation(), item.getLocation());
        int delta = request.getAdjustmentType() == StockAdjustmentType.DECREASE
                ? -request.getQuantity()
                : request.getQuantity();

        LedgerEntryType entryType = request.getAdjustmentType() == StockAdjustmentType.DECREASE
                ? LedgerEntryType.ADJUSTMENT_OUT
                : LedgerEntryType.ADJUSTMENT_IN;

        InventoryLedgerEntry entry = applyStockChange(
                item,
                location,
                delta,
                entryType,
                request.getUnitCost(),
                "ADJUSTMENT",
                null,
                request.getNotes()
        );

        return InventoryLedgerEntryDto.fromEntity(entry);
    }

    @Transactional
    public InventoryTransferDto transferStock(CreateInventoryTransferRequest request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new ValidationException("quantity", "Quantity must be greater than zero");
        }
        if (request.getFromLocation().equalsIgnoreCase(request.getToLocation())) {
            throw new ValidationException("toLocation", "Destination location must be different from source");
        }

        InventoryItem item = inventoryItemRepository.findById(request.getItemId())
                .orElseThrow(() -> new EntityNotFoundException("Inventory item not found: " + request.getItemId()));

        String fromLocation = normalizeLocation(request.getFromLocation(), item.getLocation());
        String toLocation = normalizeLocation(request.getToLocation(), item.getLocation());

        InventoryTransfer transfer = new InventoryTransfer();
        transfer.setTransferNumber(generateTransferNumber());
        transfer.setItemId(item.getId());
        transfer.setFromLocation(fromLocation);
        transfer.setToLocation(toLocation);
        transfer.setQuantity(request.getQuantity());
        transfer.setStatus(InventoryTransferStatus.POSTED);
        transfer.setNotes(request.getNotes());
        transfer.setPostedAt(OffsetDateTime.now());

        InventoryTransfer savedTransfer = inventoryTransferRepository.save(transfer);

        applyStockChange(
                item,
                fromLocation,
                -request.getQuantity(),
                LedgerEntryType.TRANSFER_OUT,
                item.getUnitCost(),
                "TRANSFER",
                savedTransfer.getId(),
                request.getNotes()
        );

        applyStockChange(
                item,
                toLocation,
                request.getQuantity(),
                LedgerEntryType.TRANSFER_IN,
                item.getUnitCost(),
                "TRANSFER",
                savedTransfer.getId(),
                request.getNotes()
        );

        return InventoryTransferDto.fromEntity(savedTransfer);
    }

    @Transactional
    public void seedOpeningBalance(InventoryItem item, int quantity, String location) {
        if (quantity <= 0) {
            return;
        }
        applyStockChange(
                item,
                normalizeLocation(location, item.getLocation()),
                quantity,
                LedgerEntryType.RECEIPT,
                item.getUnitCost(),
                "OPENING_BALANCE",
                item.getId(),
                "Opening balance"
        );
    }

    private InventoryLedgerEntry applyStockChange(
            InventoryItem item,
            String location,
            int delta,
            LedgerEntryType entryType,
            BigDecimal unitCost,
            String referenceType,
            UUID referenceId,
            String notes
    ) {
        InventoryBin bin = inventoryBinRepository
                .findByItemIdAndLocation(item.getId(), location)
                .orElseGet(() -> createBinForItem(item, location));

        int onHand = bin.getOnHand() != null ? bin.getOnHand() : 0;
        int reserved = bin.getReserved() != null ? bin.getReserved() : 0;

        if (delta < 0 && (onHand - reserved) < Math.abs(delta)) {
            throw new ValidationException("quantity", "Insufficient available stock in " + location);
        }

        int updatedOnHand = onHand + delta;
        bin.setOnHand(updatedOnHand);
        inventoryBinRepository.save(bin);

        int totalOnHand = recalcItemStock(item.getId());
        item.setCurrentStock(totalOnHand);
        if (unitCost != null && delta > 0) {
            item.setUnitCost(unitCost);
            item.setSellingPrice(item.getSellingPrice() != null ? item.getSellingPrice() : unitCost);
        }
        inventoryItemRepository.save(item);

        InventoryLedgerEntry entry = new InventoryLedgerEntry();
        entry.setItemId(item.getId());
        entry.setLocation(location);
        entry.setQuantityChange(delta);
        entry.setBalanceAfter(updatedOnHand);
        entry.setEntryType(entryType);
        entry.setReferenceType(referenceType);
        entry.setReferenceId(referenceId);
        entry.setUnitCost(unitCost);
        if (unitCost != null) {
            entry.setTotalCost(unitCost.multiply(BigDecimal.valueOf(Math.abs(delta))));
        }
        entry.setNotes(notes);
        entry.setTransactionAt(OffsetDateTime.now());

        return inventoryLedgerRepository.save(entry);
    }

    private InventoryBin createBinForItem(InventoryItem item, String location) {
        InventoryBin bin = new InventoryBin();
        bin.setItemId(item.getId());
        bin.setLocation(location);
        bin.setOnHand(0);
        bin.setReserved(0);
        bin.setReorderPoint(item.getReorderPoint());
        bin.setMinStock(item.getMinimumStock());
        bin.setMaxStock(item.getMaximumStock());
        return inventoryBinRepository.save(bin);
    }

    private int recalcItemStock(UUID itemId) {
        List<InventoryBin> bins = inventoryBinRepository.findByItemId(itemId);
        return bins.stream().mapToInt(bin -> bin.getOnHand() != null ? bin.getOnHand() : 0).sum();
    }

    private String generateTransferNumber() {
        return documentNumberGenerator.generate(
                "TRF",
                inventoryTransferRepository::existsByTransferNumber
        );
    }

    private String normalizeLocation(String requested, String fallback) {
        String trimmed = requested != null ? requested.trim() : "";
        if (!trimmed.isEmpty()) {
            return trimmed;
        }
        if (fallback != null && !fallback.isBlank()) {
            return fallback.trim();
        }
        return "MAIN";
    }
}
