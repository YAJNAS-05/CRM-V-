package com.everx.erp.inventory;

import com.everx.erp.inventory.dto.CreateInventoryItemRequest;
import com.everx.erp.inventory.dto.InventoryItemDto;
import com.everx.erp.inventory.dto.ReorderSuggestionDto;
import com.everx.erp.inventory.dto.UpdateInventoryItemRequest;
import com.everx.erp.inventory.stock.InventoryStockService;
import com.everx.erp.inventory.stock.StockAdjustmentType;
import com.everx.erp.inventory.stock.dto.CreateStockAdjustmentRequest;
import com.everx.erp.suppliers.Supplier;
import com.everx.erp.suppliers.SupplierRepository;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class InventoryItemService {

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private InventoryStockService inventoryStockService;

    public Page<InventoryItemDto> getAllInventoryItems(Pageable pageable) {
        log.info("Fetching inventory items page {} size {}", pageable.getPageNumber(), pageable.getPageSize());
        return inventoryItemRepository.findAllActive(pageable).map(InventoryItemDto::fromEntity);
    }

    public Page<InventoryItemDto> getInventoryItemsFiltered(String search, String category, String status, Pageable pageable) {
        log.info("Fetching inventory items with filters search={}, category={}, status={}", search, category, status);
        return inventoryItemRepository.findAllFiltered(search, category, status, pageable)
                .map(InventoryItemDto::fromEntity);
    }

    public InventoryItemDto getInventoryItemById(UUID itemId) {
        log.info("Fetching inventory item {}", itemId);
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Inventory item not found with id: " + itemId));
        return InventoryItemDto.fromEntity(item);
    }

    public InventoryItemDto createInventoryItem(CreateInventoryItemRequest request) {
        log.info("Creating inventory item {}", request.getItemCode());
        if (inventoryItemRepository.existsByItemCodeIgnoreCaseAndIsDeletedFalse(request.getItemCode())) {
            throw new ValidationException("itemCode", "Item code already exists");
        }

        Supplier resolvedSupplier = resolveSupplier(request.getSupplierName());
        InventoryItem item = InventoryItem.builder()
                .itemCode(request.getItemCode())
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .unitOfMeasure(request.getUnitOfMeasure())
                .currentStock(request.getQuantity())
                .minimumStock(request.getMinStockLevel())
                .maximumStock(request.getMaxStockLevel())
                .reorderPoint(resolveReorderPoint(request.getReorderPoint(), request.getMinStockLevel()))
                .unitCost(request.getUnitPrice())
                .sellingPrice(request.getUnitPrice())
                .supplierId(resolvedSupplier != null ? resolvedSupplier.getId() : null)
                .supplierName(request.getSupplierName())
                .location(request.getLocation())
                .barcode(request.getBarcode())
                .sku(request.getSku())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();
        InventoryItem savedItem = inventoryItemRepository.save(item);

        int openingStock = request.getQuantity() != null ? request.getQuantity() : 0;
        inventoryStockService.seedOpeningBalance(savedItem, openingStock, request.getLocation());

        return InventoryItemDto.fromEntity(savedItem);
    }

    public InventoryItemDto updateInventoryItem(UUID itemId, UpdateInventoryItemRequest request) {
        log.info("Updating inventory item {}", itemId);
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Inventory item not found with id: " + itemId));

        if (request.getItemCode() != null) {
            if (!request.getItemCode().equalsIgnoreCase(item.getItemCode())
                    && inventoryItemRepository.existsByItemCodeIgnoreCaseAndIsDeletedFalse(request.getItemCode())) {
                throw new ValidationException("itemCode", "Item code already exists");
            }
            item.setItemCode(request.getItemCode());
        }
        if (request.getName() != null) {
            item.setName(request.getName());
        }
        if (request.getDescription() != null) {
            item.setDescription(request.getDescription());
        }
        if (request.getCategory() != null) {
            item.setCategory(request.getCategory());
        }
        if (request.getUnitOfMeasure() != null) {
            item.setUnitOfMeasure(request.getUnitOfMeasure());
        }
        if (request.getQuantity() != null) {
            int delta = request.getQuantity() - (item.getCurrentStock() != null ? item.getCurrentStock() : 0);
            if (delta != 0) {
                CreateStockAdjustmentRequest adjustment = new CreateStockAdjustmentRequest();
                adjustment.setItemId(item.getId());
                adjustment.setLocation(request.getLocation() != null ? request.getLocation() : item.getLocation());
                adjustment.setQuantity(Math.abs(delta));
                adjustment.setAdjustmentType(delta > 0 ? StockAdjustmentType.INCREASE : StockAdjustmentType.DECREASE);
                adjustment.setUnitCost(request.getUnitPrice());
                adjustment.setNotes("Stock level updated via inventory edit");
                inventoryStockService.adjustStock(adjustment);
            }
            item.setCurrentStock(request.getQuantity());
        }
        if (request.getMinStockLevel() != null) {
            item.setMinimumStock(request.getMinStockLevel());
        }
        if (request.getMaxStockLevel() != null) {
            item.setMaximumStock(request.getMaxStockLevel());
        }
        if (request.getReorderPoint() != null) {
            item.setReorderPoint(request.getReorderPoint());
        }
        if (request.getUnitPrice() != null) {
            item.setUnitCost(request.getUnitPrice());
            item.setSellingPrice(request.getUnitPrice());
        }
        if (request.getSupplierName() != null) {
            Supplier resolvedSupplier = resolveSupplier(request.getSupplierName());
            item.setSupplierId(resolvedSupplier != null ? resolvedSupplier.getId() : null);
            item.setSupplierName(request.getSupplierName());
        }
        if (request.getLocation() != null) {
            item.setLocation(request.getLocation());
        }
        if (request.getBarcode() != null) {
            item.setBarcode(request.getBarcode());
        }
        if (request.getSku() != null) {
            item.setSku(request.getSku());
        }
        if (request.getStatus() != null) {
            item.setStatus(request.getStatus());
        }

        return InventoryItemDto.fromEntity(inventoryItemRepository.save(item));
    }

    public void deleteInventoryItem(UUID itemId) {
        log.info("Soft deleting inventory item {}", itemId);
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Inventory item not found with id: " + itemId));
        item.softDelete();
        inventoryItemRepository.save(item);
    }

    public Page<InventoryItemDto> getInventoryItemsByCategory(String category, Pageable pageable) {
        log.info("Fetching inventory items by category {}", category);
        return inventoryItemRepository.findByCategory(category, pageable).map(InventoryItemDto::fromEntity);
    }

    public Page<InventoryItemDto> getInventoryItemsByStatus(String status, Pageable pageable) {
        log.info("Fetching inventory items by status {}", status);
        return inventoryItemRepository.findByStatus(status, pageable).map(InventoryItemDto::fromEntity);
    }

    public List<InventoryItemDto> getLowStockItems() {
        log.info("Fetching low stock inventory items");
        return inventoryItemRepository.findLowStockItems().stream()
                .map(InventoryItemDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ReorderSuggestionDto> getReorderSuggestions() {
        log.info("Fetching inventory reorder suggestions");
        List<InventoryItem> items = inventoryItemRepository.findLowStockItems();
        List<ReorderSuggestionDto> suggestions = new ArrayList<>();

        for (InventoryItem item : items) {
            int currentStock = item.getCurrentStock() != null ? item.getCurrentStock() : 0;
            int reorderPoint = item.getReorderPoint() != null
                    ? item.getReorderPoint()
                    : (item.getMinimumStock() != null ? item.getMinimumStock() : 0);
            int maxStock = item.getMaximumStock() != null ? item.getMaximumStock() : reorderPoint;
            int suggested = Math.max(0, maxStock - currentStock);

            suggestions.add(ReorderSuggestionDto.builder()
                    .itemId(item.getId())
                    .itemCode(item.getItemCode())
                    .name(item.getName())
                    .currentStock(currentStock)
                    .reorderPoint(reorderPoint)
                    .maxStockLevel(maxStock)
                    .suggestedQuantity(suggested)
                    .location(item.getLocation())
                    .build());
        }

        return suggestions;
    }

    public InventoryItemDto getInventoryItemByCode(String itemCode) {
        log.info("Fetching inventory item by code {}", itemCode);
        InventoryItem item = inventoryItemRepository.findActiveByItemCode(itemCode);
        if (item == null) {
            throw new EntityNotFoundException("Inventory item not found with code: " + itemCode);
        }
        return InventoryItemDto.fromEntity(item);
    }

    private Integer resolveReorderPoint(Integer reorderPoint, Integer minStockLevel) {
        if (reorderPoint != null) {
            return reorderPoint;
        }
        return minStockLevel != null ? minStockLevel : 0;
    }

    private Supplier resolveSupplier(String supplierName) {
        if (supplierName == null || supplierName.isBlank()) {
            return null;
        }
        return supplierRepository.findByCompanyNameIgnoreCase(supplierName.trim()).orElse(null);
    }
}
