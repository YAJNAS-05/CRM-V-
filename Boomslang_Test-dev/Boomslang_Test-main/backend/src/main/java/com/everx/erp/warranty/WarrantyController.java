package com.everx.erp.warranty;

import com.everx.erp.warranty.dto.WarrantyResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/erp/warranties")
@RequiredArgsConstructor
public class WarrantyController {

    private final WarrantyService warrantyService;

    @GetMapping
    public ResponseEntity<Page<WarrantyResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(warrantyService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WarrantyResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(warrantyService.findById(id));
    }

    @PostMapping
    public ResponseEntity<WarrantyResponse> create(@RequestBody Warranty request) {
        return ResponseEntity.ok(warrantyService.create(request));
    }
}
