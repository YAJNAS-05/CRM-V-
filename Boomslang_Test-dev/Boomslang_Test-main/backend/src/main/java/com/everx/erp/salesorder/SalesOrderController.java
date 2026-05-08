package com.everx.erp.salesorder;

import com.everx.erp.salesorder.dto.SalesOrderResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/erp/sales-orders")
@RequiredArgsConstructor
public class SalesOrderController {

    private final SalesOrderService salesOrderService;

    @GetMapping
    public ResponseEntity<Page<SalesOrderResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(salesOrderService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalesOrderResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(salesOrderService.findById(id));
    }

    @PostMapping
    public ResponseEntity<SalesOrderResponse> create(@RequestBody SalesOrder request) {
        return ResponseEntity.ok(salesOrderService.create(request));
    }
}
