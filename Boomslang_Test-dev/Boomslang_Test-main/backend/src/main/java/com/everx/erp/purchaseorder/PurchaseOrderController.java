package com.everx.erp.purchaseorder;

import com.everx.erp.purchaseorder.dto.PurchaseOrderResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/erp/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @GetMapping
    public ResponseEntity<Page<PurchaseOrderResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(purchaseOrderService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(purchaseOrderService.findById(id));
    }

    @PostMapping
    public ResponseEntity<PurchaseOrderResponse> create(@RequestBody PurchaseOrder request) {
        return ResponseEntity.ok(purchaseOrderService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PurchaseOrderResponse> update(@PathVariable UUID id, @RequestBody PurchaseOrder request) {
        return ResponseEntity.ok(purchaseOrderService.update(id, request));
    }
}
