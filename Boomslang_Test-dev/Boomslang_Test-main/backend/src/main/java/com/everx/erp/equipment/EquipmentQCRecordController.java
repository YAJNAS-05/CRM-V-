package com.everx.erp.equipment;

import com.everx.erp.equipment.dto.CreateEquipmentQCRecordRequest;
import com.everx.erp.equipment.dto.EquipmentQCRecordDto;
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
@RequestMapping("/api/v1/erp/equipment-qc")
@RequiredArgsConstructor
public class EquipmentQCRecordController {

    private final EquipmentQCRecordService qcRecordService;

    @PostMapping
    public ResponseEntity<ApiResponse<EquipmentQCRecordDto>> create(@Valid @RequestBody CreateEquipmentQCRecordRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(qcRecordService.create(request), "Equipment QC record created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentQCRecordDto>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(qcRecordService.getById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<EquipmentQCRecordDto>>> getAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(qcRecordService.getAll(pageable)));
    }

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<ApiResponse<Page<EquipmentQCRecordDto>>> getByEquipment(
            @PathVariable UUID equipmentId,
            Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.ok(qcRecordService.getByEquipmentId(equipmentId, pageable)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentQCRecordDto>> update(
            @PathVariable UUID id,
            @Valid @RequestBody CreateEquipmentQCRecordRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(qcRecordService.update(id, request), "Equipment QC record updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        qcRecordService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Equipment QC record deleted successfully"));
    }
}
