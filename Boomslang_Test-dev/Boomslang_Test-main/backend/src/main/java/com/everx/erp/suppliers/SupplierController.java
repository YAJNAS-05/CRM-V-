package com.everx.erp.suppliers;

import com.everx.erp.suppliers.dto.CreateSupplierRequest;
import com.everx.erp.suppliers.dto.SupplierDto;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/erp/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping
    public ResponseEntity<ApiResponse<SupplierDto>> createSupplier(@Valid @RequestBody CreateSupplierRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(supplierService.createSupplier(request), "Supplier created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierDto>> getSupplierById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(supplierService.getSupplierById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<SupplierDto>>> getAllSuppliers(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(supplierService.getAllSuppliers(pageable)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierDto>> updateSupplier(@PathVariable UUID id, @Valid @RequestBody CreateSupplierRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(supplierService.updateSupplier(id, request), "Supplier updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSupplier(@PathVariable UUID id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Supplier deleted successfully"));
    }
}
