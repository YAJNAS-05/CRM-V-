package com.everx.erp.spareparts;

import com.everx.erp.spareparts.dto.CreateSparePartRequest;
import com.everx.erp.spareparts.dto.SparePartDto;
import com.everx.erp.spareparts.dto.UpdateSparePartRequest;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/erp/spareparts")
@RequiredArgsConstructor
public class SparePartController {

    private final SparePartService sparePartService;

    @PostMapping
    public ResponseEntity<ApiResponse<SparePartDto>> createSparePart(@Valid @RequestBody CreateSparePartRequest request) {
        SparePartDto sparePart = sparePartService.createSparePart(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(sparePart, "Spare part created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SparePartDto>> getSparePartById(@PathVariable UUID id) {
        SparePartDto sparePart = sparePartService.getSparePartById(id);
        return ResponseEntity.ok(ApiResponse.ok(sparePart));
    }

    @GetMapping("/part/{partNumber}")
    public ResponseEntity<ApiResponse<SparePartDto>> getSparePartByPartNumber(@PathVariable String partNumber) {
        SparePartDto sparePart = sparePartService.getSparePartByPartNumber(partNumber);
        return ResponseEntity.ok(ApiResponse.ok(sparePart));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<SparePartDto>>> getAllSpareParts(Pageable pageable) {
        Page<SparePartDto> spareParts = sparePartService.getAllSpareParts(pageable);
        return ResponseEntity.ok(ApiResponse.ok(spareParts));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<Page<SparePartDto>>> getSparePartsByCategory(
            @PathVariable String category, Pageable pageable) {
        Page<SparePartDto> spareParts = sparePartService.getSparePartsByCategory(category, pageable);
        return ResponseEntity.ok(ApiResponse.ok(spareParts));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<SparePartDto>>> getLowStockParts() {
        List<SparePartDto> spareParts = sparePartService.getLowStockParts();
        return ResponseEntity.ok(ApiResponse.ok(spareParts));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SparePartDto>> updateSparePart(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateSparePartRequest request) {
        SparePartDto sparePart = sparePartService.updateSparePart(id, request);
        return ResponseEntity.ok(ApiResponse.ok(sparePart, "Spare part updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSparePart(@PathVariable UUID id) {
        sparePartService.deleteSparePart(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Spare part deleted successfully"));
    }
}
