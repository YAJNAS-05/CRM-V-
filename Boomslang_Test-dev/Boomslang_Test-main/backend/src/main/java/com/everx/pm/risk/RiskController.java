package com.everx.pm.risk;

import com.everx.pm.risk.dto.CreateRiskRequest;
import com.everx.pm.risk.dto.RiskDto;
import com.everx.pm.risk.dto.UpdateRiskRequest;
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
@RequestMapping("/api/v1/pm/risks")
@RequiredArgsConstructor
public class RiskController {

    private final RiskService riskService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<RiskDto>>> getRisks(
            @RequestParam UUID projectId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(riskService.getRisks(projectId, pageable)));
    }

    @GetMapping("/{riskId}")
    public ResponseEntity<ApiResponse<RiskDto>> getRisk(@PathVariable UUID riskId) {
        return ResponseEntity.ok(ApiResponse.ok(riskService.getRisk(riskId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RiskDto>> createRisk(@Valid @RequestBody CreateRiskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(riskService.createRisk(request), "Risk created"));
    }

    @PutMapping("/{riskId}")
    public ResponseEntity<ApiResponse<RiskDto>> updateRisk(
            @PathVariable UUID riskId,
            @RequestBody UpdateRiskRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(riskService.updateRisk(riskId, request), "Risk updated"));
    }

    @DeleteMapping("/{riskId}")
    public ResponseEntity<ApiResponse<Void>> deleteRisk(@PathVariable UUID riskId) {
        riskService.deleteRisk(riskId);
        return ResponseEntity.ok(ApiResponse.okMessage("Risk deleted"));
    }
}
