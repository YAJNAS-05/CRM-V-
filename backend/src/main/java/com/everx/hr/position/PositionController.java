package com.everx.hr.position;

import com.everx.hr.position.dto.CreatePositionRequest;
import com.everx.hr.position.dto.PositionDto;
import com.everx.hr.position.dto.UpdatePositionRequest;
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
@RequestMapping("/api/v1/hr/positions")
@RequiredArgsConstructor
public class PositionController {

    private final PositionService positionService;

    @PostMapping
    public ResponseEntity<ApiResponse<PositionDto>> createPosition(@Valid @RequestBody CreatePositionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(positionService.createPosition(request), "Position created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PositionDto>> getPositionById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(positionService.getPositionById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PositionDto>>> getPositions(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(positionService.getPositions(pageable, search)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PositionDto>> updatePosition(
            @PathVariable UUID id,
            @RequestBody UpdatePositionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(positionService.updatePosition(id, request), "Position updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePosition(@PathVariable UUID id) {
        positionService.deletePosition(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Position deleted successfully"));
    }
}
