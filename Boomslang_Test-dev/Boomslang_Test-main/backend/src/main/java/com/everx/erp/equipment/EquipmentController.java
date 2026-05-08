package com.everx.erp.equipment;

import com.everx.erp.equipment.dto.CreateEquipmentRequest;
import com.everx.erp.equipment.dto.EquipmentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/erp/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;

    @GetMapping
    public ResponseEntity<Page<EquipmentResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(equipmentService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipmentResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(equipmentService.findById(id));
    }

    @GetMapping("/number/{equipmentNumber}")
    public ResponseEntity<EquipmentResponse> getByNumber(@PathVariable String equipmentNumber) {
        return ResponseEntity.ok(equipmentService.findByNumber(equipmentNumber));
    }

    @PostMapping
    public ResponseEntity<EquipmentResponse> create(@RequestBody CreateEquipmentRequest request) {
        return ResponseEntity.ok(equipmentService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipmentResponse> update(@PathVariable UUID id, @RequestBody CreateEquipmentRequest request) {
        return ResponseEntity.ok(equipmentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        equipmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
