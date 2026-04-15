package com.everx.erp.equipment;

import com.everx.erp.equipment.dto.CreateEquipmentRequest;
import com.everx.erp.equipment.dto.EquipmentDto;
import com.everx.erp.equipment.dto.UpdateEquipmentRequest;
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
@RequestMapping("/api/v1/erp/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<EquipmentDto>> createEquipment(@Valid @RequestBody CreateEquipmentRequest request) {
        EquipmentDto equipment = equipmentService.createEquipment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(equipment, "Equipment created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentDto>> getEquipmentById(@PathVariable UUID id) {
        EquipmentDto equipment = equipmentService.getEquipmentById(id);
        return ResponseEntity.ok(ApiResponse.ok(equipment));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<EquipmentDto>> getEquipmentByCode(@PathVariable String code) {
        EquipmentDto equipment = equipmentService.getEquipmentByCode(code);
        return ResponseEntity.ok(ApiResponse.ok(equipment));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<EquipmentDto>>> getAllEquipment(Pageable pageable) {
        Page<EquipmentDto> equipment = equipmentService.getAllEquipment(pageable);
        return ResponseEntity.ok(ApiResponse.ok(equipment));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<Page<EquipmentDto>>> getEquipmentByStatus(
            @PathVariable EquipmentStatus status, Pageable pageable) {
        Page<EquipmentDto> equipment = equipmentService.getEquipmentByStatus(status, pageable);
        return ResponseEntity.ok(ApiResponse.ok(equipment));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<Page<EquipmentDto>>> getEquipmentByCategory(
            @PathVariable String category, Pageable pageable) {
        Page<EquipmentDto> equipment = equipmentService.getEquipmentByCategory(category, pageable);
        return ResponseEntity.ok(ApiResponse.ok(equipment));
    }

    @GetMapping("/warehouse/{location}")
    public ResponseEntity<ApiResponse<Page<EquipmentDto>>> getEquipmentByWarehouse(
            @PathVariable String location, Pageable pageable) {
        Page<EquipmentDto> equipment = equipmentService.getEquipmentByWarehouse(location, pageable);
        return ResponseEntity.ok(ApiResponse.ok(equipment));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<EquipmentDto>>> searchEquipment(
            @RequestParam String q, Pageable pageable) {
        Page<EquipmentDto> equipment = equipmentService.searchEquipment(q, pageable);
        return ResponseEntity.ok(ApiResponse.ok(equipment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentDto>> updateEquipment(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateEquipmentRequest request) {
        EquipmentDto equipment = equipmentService.updateEquipment(id, request);
        return ResponseEntity.ok(ApiResponse.ok(equipment, "Equipment updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEquipment(@PathVariable UUID id) {
        equipmentService.deleteEquipment(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Equipment deleted successfully"));
    }
}
