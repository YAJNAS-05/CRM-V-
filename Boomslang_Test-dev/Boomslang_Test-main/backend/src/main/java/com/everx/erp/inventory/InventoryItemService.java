package com.everx.erp.inventory;

import com.everx.erp.inventory.dto.CreateInventoryItemRequest;
import com.everx.erp.inventory.dto.InventoryItemDto;
import com.everx.erp.inventory.dto.UpdateInventoryItemRequest;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class InventoryItemService {

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    public Page<InventoryItemDto> getAllInventoryItems(Pageable pageable) {
        log.info("Fetching inventory items page {} size {}", pageable.getPageNumber(), pageable.getPageSize());
        return inventoryItemRepository.findAllActive(pageable).map(InventoryItemDto::fromEntity);
    }

    public InventoryItemDto getInventoryItemById(UUID itemId) {
        log.info("Fetching inventory item {}", itemId);
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Inventory item not found with id: " + itemId));
        return InventoryItemDto.fromEntity(item);
    }

    public InventoryItemDto createInventoryItem(CreateInventoryItemRequest request) {
        log.info("Creating inventory item {}", request.getItemCode());
        InventoryItem item = InventoryItem.builder()
                .itemCode(request.getItemCode())
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .unitOfMeasure(request.getUnitOfMeasure())
                .currentStock(request.getQuantity())
                .minimumStock(request.getMinStockLevel())
                .maximumStock(request.getMaxStockLevel())
                .unitCost(request.getUnitPrice()) // Using unitPrice as unitCost for now
                .sellingPrice(request.getUnitPrice())
                .supplierId(null) // Will be set from supplier name lookup if needed
                .location(request.getLocation())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();
        return InventoryItemDto.fromEntity(inventoryItemRepository.save(item));
    }

    public InventoryItemDto updateInventoryItem(UUID itemId, UpdateInventoryItemRequest request) {
        log.info("Updating inventory item {}", itemId);
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Inventory item not found with id: " + itemId));

        if (request.getItemCode() != null) {
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
            item.setCurrentStock(request.getQuantity());
        }
        if (request.getMinStockLevel() != null) {
            item.setMinimumStock(request.getMinStockLevel());
        }
        if (request.getMaxStockLevel() != null) {
            item.setMaximumStock(request.getMaxStockLevel());
        }
        if (request.getUnitPrice() != null) {
            item.setUnitCost(request.getUnitPrice());
            item.setSellingPrice(request.getUnitPrice());
        }
        if (request.getSupplierName() != null) {
            // Will be set from supplier name lookup if needed
            item.setSupplierId(null);
        }
        if (request.getLocation() != null) {
            item.setLocation(request.getLocation());
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

    public InventoryItemDto getInventoryItemByCode(String itemCode) {
        log.info("Fetching inventory item by code {}", itemCode);
        InventoryItem item = inventoryItemRepository.findByItemCode(itemCode);
        if (item == null) {
            throw new EntityNotFoundException("Inventory item not found with code: " + itemCode);
        }
        return InventoryItemDto.fromEntity(item);
    }
}
