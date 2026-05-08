package com.everx.erp.logistics;

import com.everx.erp.logistics.dto.ShipmentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/erp/shipments")
@RequiredArgsConstructor
public class LogisticsController {

    private final ShipmentService shipmentService;

    @GetMapping
    public ResponseEntity<Page<ShipmentResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(shipmentService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShipmentResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(shipmentService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ShipmentResponse> create(@RequestBody Shipment request) {
        return ResponseEntity.ok(shipmentService.create(request));
    }
}
