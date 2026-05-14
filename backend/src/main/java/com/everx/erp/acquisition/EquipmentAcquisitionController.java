package com.everx.erp.acquisition;

import com.everx.erp.acquisition.dto.CreateEquipmentAcquisitionRequest;
import com.everx.erp.acquisition.dto.EquipmentAcquisitionDto;
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
@RequestMapping("/api/v1/erp/acquisitions")
@RequiredArgsConstructor
public class EquipmentAcquisitionController {

    private final EquipmentAcquisitionService acquisitionService;

    @PostMapping
    public ResponseEntity<ApiResponse<EquipmentAcquisitionDto>> create(@Valid @RequestBody CreateEquipmentAcquisitionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(acquisitionService.create(request), "Equipment acquisition created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentAcquisitionDto>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(acquisitionService.getById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<EquipmentAcquisitionDto>>> getAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(acquisitionService.getAll(pageable)));
    }

    @GetMapping("/stage/{stage}")
    public ResponseEntity<ApiResponse<Page<EquipmentAcquisitionDto>>> getByStage(@PathVariable String stage, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(acquisitionService.getByStage(stage, pageable)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentAcquisitionDto>> update(
            @PathVariable UUID id,
            @Valid @RequestBody CreateEquipmentAcquisitionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(acquisitionService.update(id, request), "Equipment acquisition updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        acquisitionService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Equipment acquisition deleted successfully"));
    }
}
