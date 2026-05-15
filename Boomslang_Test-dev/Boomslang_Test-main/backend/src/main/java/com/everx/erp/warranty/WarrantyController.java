package com.everx.erp.warranty;

import com.everx.erp.warranty.dto.CreateWarrantyRequest;
import com.everx.erp.warranty.dto.WarrantyDto;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/erp/warranties")
@RequiredArgsConstructor
public class WarrantyController {

    private final WarrantyService warrantyService;

    @PostMapping
    public ResponseEntity<ApiResponse<WarrantyDto>> createWarranty(@Valid @RequestBody CreateWarrantyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(warrantyService.createWarranty(request), "Warranty created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WarrantyDto>> getWarrantyById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(warrantyService.getWarrantyById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<WarrantyDto>>> getAllWarranties(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(warrantyService.getAllWarranties(pageable)));
    }

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<ApiResponse<List<WarrantyDto>>> getWarrantiesByEquipmentId(@PathVariable UUID equipmentId) {
        return ResponseEntity.ok(ApiResponse.ok(warrantyService.getWarrantiesByEquipmentId(equipmentId)));
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<ApiResponse<Page<WarrantyDto>>> getWarrantiesByAccountId(@PathVariable UUID accountId, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(warrantyService.getWarrantiesByAccountId(accountId, pageable)));
    }

    @GetMapping("/expiring")
    public ResponseEntity<ApiResponse<List<WarrantyDto>>> getExpiringWarranties(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.ok(warrantyService.getExpiringWarranties(date)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WarrantyDto>> updateWarranty(@PathVariable UUID id, @Valid @RequestBody CreateWarrantyRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(warrantyService.updateWarranty(id, request), "Warranty updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteWarranty(@PathVariable UUID id) {
        warrantyService.deleteWarranty(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Warranty deleted successfully"));
    }
}
