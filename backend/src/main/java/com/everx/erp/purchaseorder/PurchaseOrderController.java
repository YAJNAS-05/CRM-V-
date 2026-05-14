package com.everx.erp.purchaseorder;

import com.everx.erp.purchaseorder.dto.CreatePurchaseOrderRequest;
import com.everx.erp.purchaseorder.dto.PurchaseOrderDto;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/erp/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @PostMapping
    @PreAuthorize("hasAuthority('ERP_CREATE')")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> createPurchaseOrder(@Valid @RequestBody CreatePurchaseOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(purchaseOrderService.createPurchaseOrder(request), "Purchase order created successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> getPurchaseOrderById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(purchaseOrderService.getPurchaseOrderById(id)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Page<PurchaseOrderDto>>> getAllPurchaseOrders(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(purchaseOrderService.getAllPurchaseOrders(pageable)));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Page<PurchaseOrderDto>>> getPurchaseOrdersByStatus(
            @PathVariable String status, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(purchaseOrderService.getPurchaseOrdersByStatus(status, pageable)));
    }

    @GetMapping("/supplier/{supplierId}")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Page<PurchaseOrderDto>>> getPurchaseOrdersBySupplierId(
            @PathVariable UUID supplierId, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(purchaseOrderService.getPurchaseOrdersBySupplierId(supplierId, pageable)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ERP_EDIT')")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> updatePurchaseOrder(
            @PathVariable UUID id, @Valid @RequestBody CreatePurchaseOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(purchaseOrderService.updatePurchaseOrder(id, request), "Purchase order updated successfully"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ERP_EDIT')")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> updateStatus(@PathVariable UUID id, @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.ok(purchaseOrderService.updateStatus(id, status), "Purchase order status updated"));
    }

    @PostMapping("/{id}/receive")
    @PreAuthorize("hasAuthority('ERP_EDIT')")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> receivePurchaseOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(purchaseOrderService.receivePurchaseOrder(id), "Purchase order received and inventory synchronized"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ERP_DELETE')")
    public ResponseEntity<ApiResponse<Void>> deletePurchaseOrder(@PathVariable UUID id) {
        purchaseOrderService.deletePurchaseOrder(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Purchase order deleted successfully"));
    }
}
