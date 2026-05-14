package com.everx.erp.logistics;

import com.everx.erp.logistics.dto.CreateShipmentRequest;
import com.everx.erp.logistics.dto.ShipmentDto;
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
@RequestMapping("/api/v1/erp/shipments")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;

    @PostMapping
    @PreAuthorize("hasAuthority('ERP_CREATE')")
    public ResponseEntity<ApiResponse<ShipmentDto>> createShipment(@Valid @RequestBody CreateShipmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(shipmentService.createShipment(request), "Shipment created successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<ShipmentDto>> getShipmentById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(shipmentService.getShipmentById(id)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Page<ShipmentDto>>> getAllShipments(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(shipmentService.getAllShipments(pageable)));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAuthority('ERP_VIEW')")
    public ResponseEntity<ApiResponse<Page<ShipmentDto>>> getShipmentsByStatus(@PathVariable String status, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(shipmentService.getShipmentsByStatus(status, pageable)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ERP_EDIT')")
    public ResponseEntity<ApiResponse<ShipmentDto>> updateShipment(@PathVariable UUID id, @Valid @RequestBody CreateShipmentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(shipmentService.updateShipment(id, request), "Shipment updated successfully"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ERP_EDIT')")
    public ResponseEntity<ApiResponse<ShipmentDto>> updateShipmentStatus(@PathVariable UUID id, @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.ok(shipmentService.updateStatus(id, status), "Shipment status updated"));
    }

    @PostMapping("/{id}/deliver")
    @PreAuthorize("hasAuthority('ERP_EDIT')")
    public ResponseEntity<ApiResponse<ShipmentDto>> deliverShipment(
            @PathVariable UUID id,
            @RequestParam boolean clientSignatureObtained,
            @RequestParam String conditionOnDelivery) {
        return ResponseEntity.ok(ApiResponse.ok(
                shipmentService.deliverShipment(id, clientSignatureObtained, conditionOnDelivery),
                "Shipment delivered and downstream records synchronized"
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ERP_DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteShipment(@PathVariable UUID id) {
        shipmentService.deleteShipment(id);
        return ResponseEntity.ok(ApiResponse.okMessage("Shipment deleted successfully"));
    }
}
