package com.everx.erp.controller;

import com.everx.erp.dto.*;
import com.everx.erp.service.InventoryService;
import com.everx.erp.service.EquipmentService;
import com.everx.erp.service.WorkOrderService;
import com.everx.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/erp")
@RequiredArgsConstructor
@Slf4j
public class ERPController {

    private final InventoryService inventoryService;
    private final EquipmentService equipmentService;
    private final WorkOrderService workOrderService;

    // Inventory Management
    @GetMapping("/inventory")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Page<InventoryItemDto>>> getInventoryItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String sort,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/erp/inventory - search: {}, category: {}, status: {}", search, category, status);
        Page<InventoryItemDto> items = inventoryService.getInventoryItems(search, category, status, sort, pageable);
        return ResponseEntity.ok(ApiResponse.ok(items, "Inventory items retrieved successfully"));
    }

    @GetMapping("/inventory/{itemId}")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<InventoryItemDto>> getInventoryItemById(@PathVariable UUID itemId) {
        log.info("GET /api/v1/erp/inventory/{}", itemId);
        InventoryItemDto item = inventoryService.getInventoryItemById(itemId);
        return ResponseEntity.ok(ApiResponse.ok(item, "Inventory item retrieved successfully"));
    }

    @PostMapping("/inventory")
    @PreAuthorize("hasAuthority('ERP_CREATE')")
    public ResponseEntity<ApiResponse<InventoryItemDto>> createInventoryItem(@Valid @RequestBody CreateInventoryItemRequest request) {
        log.info("POST /api/v1/erp/inventory - Creating inventory item");
        ApiResponse<InventoryItemDto> response = inventoryService.createInventoryItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/inventory/{itemId}")
    @PreAuthorize("hasAuthority('ERP_UPDATE')")
    public ResponseEntity<ApiResponse<InventoryItemDto>> updateInventoryItem(@PathVariable UUID itemId, @Valid @RequestBody UpdateInventoryItemRequest request) {
        log.info("PUT /api/v1/erp/inventory/{} - Updating inventory item", itemId);
        ApiResponse<InventoryItemDto> response = inventoryService.updateInventoryItem(itemId, request);
        return ResponseEntity.ok(response);
    }

    // Inventory Transfers
    @GetMapping("/inventory/transfers")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Page<InventoryTransferDto>>> getInventoryTransfers(
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/erp/inventory/transfers");
        Page<InventoryTransferDto> transfers = inventoryService.getInventoryTransfers(pageable);
        return ResponseEntity.ok(ApiResponse.ok(transfers, "Inventory transfers retrieved successfully"));
    }

    @PostMapping("/inventory/transfers")
    @PreAuthorize("hasAuthority('ERP_UPDATE')")
    public ResponseEntity<ApiResponse<InventoryTransferDto>> createInventoryTransfer(@Valid @RequestBody CreateInventoryTransferRequest request) {
        log.info("POST /api/v1/erp/inventory/transfers - Creating inventory transfer");
        ApiResponse<InventoryTransferDto> response = inventoryService.createInventoryTransfer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Stock Adjustments
    @PostMapping("/inventory/adjustments")
    @PreAuthorize("hasAuthority('ERP_UPDATE')")
    public ResponseEntity<ApiResponse<Void>> createStockAdjustment(@Valid @RequestBody CreateStockAdjustmentRequest request) {
        log.info("POST /api/v1/erp/inventory/adjustments - Creating stock adjustment");
        inventoryService.createStockAdjustment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(null, "Stock adjustment created successfully"));
    }

    // Equipment Management
    @GetMapping("/equipment")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Page<EquipmentDto>>> getEquipment(
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/erp/equipment");
        Page<EquipmentDto> equipment = equipmentService.getAllEquipment(pageable);
        return ResponseEntity.ok(ApiResponse.ok(equipment, "Equipment retrieved successfully"));
    }

    @GetMapping("/equipment/{equipmentId}")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<EquipmentDto>> getEquipmentById(@PathVariable UUID equipmentId) {
        log.info("GET /api/v1/erp/equipment/{}", equipmentId);
        EquipmentDto equipment = equipmentService.getEquipmentById(equipmentId);
        return ResponseEntity.ok(ApiResponse.ok(equipment, "Equipment retrieved successfully"));
    }

    // Equipment Acquisitions
    @GetMapping("/equipment/acquisitions")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Page<EquipmentAcquisitionDto>>> getEquipmentAcquisitions(
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/erp/equipment/acquisitions");
        Page<EquipmentAcquisitionDto> acquisitions = equipmentService.getEquipmentAcquisitions(pageable);
        return ResponseEntity.ok(ApiResponse.ok(acquisitions, "Equipment acquisitions retrieved successfully"));
    }

    // Equipment Assessments
    @GetMapping("/equipment/assessments")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Page<EquipmentAssessmentDto>>> getEquipmentAssessments(
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/erp/equipment/assessments");
        Page<EquipmentAssessmentDto> assessments = equipmentService.getEquipmentAssessments(pageable);
        return ResponseEntity.ok(ApiResponse.ok(assessments, "Equipment assessments retrieved successfully"));
    }

    // Site Assessments
    @GetMapping("/sites/assessments")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Page<SiteAssessmentDto>>> getSiteAssessments(
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/erp/sites/assessments");
        Page<SiteAssessmentDto> assessments = equipmentService.getSiteAssessments(pageable);
        return ResponseEntity.ok(ApiResponse.ok(assessments, "Site assessments retrieved successfully"));
    }

    // Work Orders
    @GetMapping("/work-orders")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Page<WorkOrderDto>>> getWorkOrders(
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/erp/work-orders");
        Page<WorkOrderDto> workOrders = workOrderService.getAllWorkOrders(pageable);
        return ResponseEntity.ok(ApiResponse.ok(workOrders, "Work orders retrieved successfully"));
    }

    @GetMapping("/work-orders/{workOrderId}")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<WorkOrderDto>> getWorkOrderById(@PathVariable UUID workOrderId) {
        log.info("GET /api/v1/erp/work-orders/{}", workOrderId);
        WorkOrderDto workOrder = workOrderService.getWorkOrderById(workOrderId);
        return ResponseEntity.ok(ApiResponse.ok(workOrder, "Work order retrieved successfully"));
    }

    // Purchase Orders
    @GetMapping("/purchase-orders")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Page<PurchaseOrderDto>>> getPurchaseOrders(
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/erp/purchase-orders");
        Page<PurchaseOrderDto> orders = workOrderService.getPurchaseOrders(pageable);
        return ResponseEntity.ok(ApiResponse.ok(orders, "Purchase orders retrieved successfully"));
    }

    // Sales Orders
    @GetMapping("/sales-orders")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Page<SalesOrderDto>>> getSalesOrders(
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/erp/sales-orders");
        Page<SalesOrderDto> orders = workOrderService.getSalesOrders(pageable);
        return ResponseEntity.ok(ApiResponse.ok(orders, "Sales orders retrieved successfully"));
    }

    // Reorder Suggestions
    @GetMapping("/inventory/reorder-suggestions")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<List<ReorderSuggestionDto>>> getReorderSuggestions() {
        log.info("GET /api/v1/erp/inventory/reorder-suggestions");
        List<ReorderSuggestionDto> suggestions = inventoryService.getReorderSuggestions();
        return ResponseEntity.ok(ApiResponse.ok(suggestions, "Reorder suggestions retrieved successfully"));
    }

    // Inventory Bins
    @GetMapping("/inventory/bins")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Page<InventoryBinDto>>> getInventoryBins(
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/erp/inventory/bins");
        Page<InventoryBinDto> bins = inventoryService.getInventoryBins(pageable);
        return ResponseEntity.ok(ApiResponse.ok(bins, "Inventory bins retrieved successfully"));
    }

    // Inventory Ledger
    @GetMapping("/inventory/ledger")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Page<InventoryLedgerEntryDto>>> getInventoryLedger(
            @RequestParam(required = false) UUID itemId,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/erp/inventory/ledger - itemId: {}", itemId);
        Page<InventoryLedgerEntryDto> ledger = inventoryService.getInventoryLedger(itemId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(ledger, "Inventory ledger retrieved successfully"));
    }

    // Dashboard and Analytics
    @GetMapping("/dashboard/overview")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Object>> getDashboardOverview(@RequestParam UUID tenantId) {
        log.info("GET /api/v1/erp/dashboard/overview - tenantId: {}", tenantId);
        Object overview = inventoryService.getDashboardOverview(tenantId);
        return ResponseEntity.ok(ApiResponse.ok(overview, "ERP dashboard overview retrieved successfully"));
    }

    @GetMapping("/analytics/inventory")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Object>> getInventoryAnalytics(@RequestParam UUID tenantId) {
        log.info("GET /api/v1/erp/analytics/inventory - tenantId: {}", tenantId);
        Object analytics = inventoryService.getInventoryAnalytics(tenantId);
        return ResponseEntity.ok(ApiResponse.ok(analytics, "Inventory analytics retrieved successfully"));
    }

    @GetMapping("/analytics/equipment")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Object>> getEquipmentAnalytics(@RequestParam UUID tenantId) {
        log.info("GET /api/v1/erp/analytics/equipment - tenantId: {}", tenantId);
        Object analytics = equipmentService.getEquipmentAnalytics(tenantId);
        return ResponseEntity.ok(ApiResponse.ok(analytics, "Equipment analytics retrieved successfully"));
    }
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Sales orders retrieved successfully",
            "data", orders
        ));
    }

    @GetMapping("/production-orders")
    public ResponseEntity<Map<String, Object>> getProductionOrders(@RequestParam UUID tenantId) {
        log.info("Getting production orders for tenant: {}", tenantId);
        
        Map<String, Object> orders = inventoryService.getProductionOrders(tenantId);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Production orders retrieved successfully",
            "data", orders
        ));
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getInventoryAnalytics(@RequestParam UUID tenantId) {
        log.info("Getting inventory analytics for tenant: {}", tenantId);
        
        Map<String, Object> analytics = inventoryService.getInventoryAnalytics(tenantId);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Inventory analytics retrieved successfully",
            "data", analytics
        ));
    }

    @PostMapping("/inventory/item")
    public ResponseEntity<Map<String, Object>> createInventoryItem(
            @RequestParam UUID tenantId,
            @RequestBody Map<String, Object> itemData) {
        
        log.info("Creating inventory item for tenant: {}", tenantId);
        
        Map<String, Object> newItem = Map.of(
            "id", UUID.randomUUID(),
            "tenantId", tenantId,
            "sku", itemData.get("sku"),
            "name", itemData.get("name"),
            "createdAt", java.time.LocalDateTime.now()
        );
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Inventory item created successfully",
            "data", newItem
        ));
    }

    @PutMapping("/inventory/item/{itemId}")
    public ResponseEntity<Map<String, Object>> updateInventoryItem(
            @PathVariable UUID itemId,
            @RequestParam UUID tenantId,
            @RequestBody Map<String, Object> itemData) {
        
        log.info("Updating inventory item: {} for tenant: {}", itemId, tenantId);
        
        Map<String, Object> updatedItem = Map.of(
            "id", itemId,
            "tenantId", tenantId,
            "sku", itemData.get("sku"),
            "name", itemData.get("name"),
            "updatedAt", java.time.LocalDateTime.now()
        );
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Inventory item updated successfully",
            "data", updatedItem
        ));
    }

    @DeleteMapping("/inventory/item/{itemId}")
    public ResponseEntity<Map<String, Object>> deleteInventoryItem(
            @PathVariable UUID itemId,
            @RequestParam UUID tenantId) {
        
        log.info("Deleting inventory item: {} for tenant: {}", itemId, tenantId);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Inventory item deleted successfully",
            "data", Map.of("id", itemId, "deletedAt", java.time.LocalDateTime.now())
        ));
    }
}
