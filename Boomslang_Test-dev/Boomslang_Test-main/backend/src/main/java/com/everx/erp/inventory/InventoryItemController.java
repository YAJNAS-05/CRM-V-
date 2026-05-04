package com.everx.erp.inventory;

import com.everx.erp.inventory.dto.CreateInventoryItemRequest;
import com.everx.erp.inventory.dto.InventoryItemDto;
import com.everx.erp.inventory.dto.ReorderSuggestionDto;
import com.everx.erp.inventory.dto.UpdateInventoryItemRequest;
import com.everx.shared.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/erp/inventory")
@Validated
@Slf4j
public class InventoryItemController {

    @Autowired
    private InventoryItemService inventoryItemService;

    @GetMapping
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Page<InventoryItemDto>>> getAllInventoryItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/erp/inventory");
        Page<InventoryItemDto> items = inventoryItemService.getInventoryItemsFiltered(search, category, status, pageable);
        return ResponseEntity.ok(ApiResponse.ok(items, "Inventory items retrieved successfully"));
    }

    @GetMapping("/{itemId}")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<InventoryItemDto>> getInventoryItemById(@PathVariable UUID itemId) {
        log.info("GET /api/v1/erp/inventory/{}", itemId);
        InventoryItemDto item = inventoryItemService.getInventoryItemById(itemId);
        return ResponseEntity.ok(ApiResponse.ok(item, "Inventory item retrieved successfully"));
    }

    @GetMapping("/code/{itemCode}")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<InventoryItemDto>> getInventoryItemByCode(@PathVariable String itemCode) {
        log.info("GET /api/v1/erp/inventory/code/{}", itemCode);
        InventoryItemDto item = inventoryItemService.getInventoryItemByCode(itemCode);
        return ResponseEntity.ok(ApiResponse.ok(item, "Inventory item retrieved successfully"));
    }

    @GetMapping("/category/{category}")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Page<InventoryItemDto>>> getInventoryItemsByCategory(
            @PathVariable String category,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/erp/inventory/category/{}", category);
        Page<InventoryItemDto> items = inventoryItemService.getInventoryItemsByCategory(category, pageable);
        return ResponseEntity.ok(ApiResponse.ok(items, "Inventory items retrieved successfully"));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Page<InventoryItemDto>>> getInventoryItemsByStatus(
            @PathVariable String status,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/erp/inventory/status/{}", status);
        Page<InventoryItemDto> items = inventoryItemService.getInventoryItemsByStatus(status, pageable);
        return ResponseEntity.ok(ApiResponse.ok(items, "Inventory items retrieved successfully"));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<List<InventoryItemDto>>> getLowStockItems() {
        log.info("GET /api/v1/erp/inventory/low-stock");
        List<InventoryItemDto> items = inventoryItemService.getLowStockItems();
        return ResponseEntity.ok(ApiResponse.ok(items, "Low stock items retrieved successfully"));
    }

    @GetMapping("/reorder-suggestions")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<List<ReorderSuggestionDto>>> getReorderSuggestions() {
        log.info("GET /api/v1/erp/inventory/reorder-suggestions");
        List<ReorderSuggestionDto> suggestions = inventoryItemService.getReorderSuggestions();
        return ResponseEntity.ok(ApiResponse.ok(suggestions, "Reorder suggestions retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ERP_CREATE')")
    public ResponseEntity<ApiResponse<InventoryItemDto>> createInventoryItem(@Valid @RequestBody CreateInventoryItemRequest request) {
        log.info("POST /api/v1/erp/inventory");
        InventoryItemDto item = inventoryItemService.createInventoryItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(item, "Inventory item created successfully"));
    }

    @PutMapping("/{itemId}")
    @PreAuthorize("hasAuthority('ERP_EDIT')")
    public ResponseEntity<ApiResponse<InventoryItemDto>> updateInventoryItem(
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateInventoryItemRequest request) {
        log.info("PUT /api/v1/erp/inventory/{}", itemId);
        InventoryItemDto item = inventoryItemService.updateInventoryItem(itemId, request);
        return ResponseEntity.ok(ApiResponse.ok(item, "Inventory item updated successfully"));
    }

    @DeleteMapping("/{itemId}")
    @PreAuthorize("hasAuthority('ERP_DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteInventoryItem(@PathVariable UUID itemId) {
        log.info("DELETE /api/v1/erp/inventory/{}", itemId);
        inventoryItemService.deleteInventoryItem(itemId);
        return ResponseEntity.ok(ApiResponse.okMessage("Inventory item deleted successfully"));
    }
}
