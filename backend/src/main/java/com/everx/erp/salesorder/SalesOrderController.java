package com.everx.erp.salesorder;

import com.everx.erp.salesorder.dto.CreateSalesOrderRequest;
import com.everx.erp.salesorder.dto.SalesOrderDto;
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
@RequestMapping("/api/v1/erp/sales-orders")
@RequiredArgsConstructor
public class SalesOrderController {

    private final SalesOrderService salesOrderService;

    @PostMapping
    @PreAuthorize("hasAuthority('ERP_CREATE')")
    public ResponseEntity<ApiResponse<SalesOrderDto>> createSalesOrder(@Valid @RequestBody CreateSalesOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(salesOrderService.createSalesOrder(request), "Sales order created successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<SalesOrderDto>> getSalesOrderById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(salesOrderService.getSalesOrderById(id)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Page<SalesOrderDto>>> getAllSalesOrders(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(salesOrderService.getAllSalesOrders(pageable)));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Page<SalesOrderDto>>> getSalesOrdersByStatus(@PathVariable String status, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(salesOrderService.getSalesOrdersByStatus(status, pageable)));
    }

    @GetMapping("/account/{accountId}")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Page<SalesOrderDto>>> getSalesOrdersByAccountId(@PathVariable UUID accountId, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(salesOrderService.getSalesOrdersByAccountId(accountId, pageable)));
    }

    @GetMapping("/deal/{dealId}")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Page<SalesOrderDto>>> getSalesOrdersByDealId(@PathVariable UUID dealId, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(salesOrderService.getSalesOrdersByDealId(dealId, pageable)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ERP_EDIT')")
    public ResponseEntity<ApiResponse<SalesOrderDto>> updateSalesOrder(@PathVariable UUID id, @Valid @RequestBody CreateSalesOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(salesOrderService.updateSalesOrder(id, request), "Sales order updated successfully"));
    }

    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasAuthority('ERP_EDIT')")
    public ResponseEntity<ApiResponse<SalesOrderDto>> confirmSalesOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(salesOrderService.confirmSalesOrder(id), "Sales order confirmed and downstream records generated"));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('ERP_EDIT')")
    public ResponseEntity<ApiResponse<SalesOrderDto>> cancelSalesOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(salesOrderService.cancelSalesOrder(id), "Sales order cancelled and equipment released back to warehouse"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ERP_DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteSalesOrder(@PathVariable UUID id) {
        salesOrderService.deleteSalesOrder(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Sales order deleted successfully"));
    }
}
