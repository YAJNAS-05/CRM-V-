package com.everx.finance.consolidation;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/consolidation")
@RequiredArgsConstructor
public class ConsolidationController {

    private final GlConsolidationService consolidationService;
    private final IntercompanyConsolidationController intercompanyService;

    @GetMapping
    public ResponseEntity<List<GlConsolidation>> getConsolidations(
            @RequestParam String companyCode,
            @RequestParam String fiscalPeriod) {
        return ResponseEntity.ok(consolidationService.getConsolidations(companyCode, fiscalPeriod));
    }

    @PostMapping("/run")
    public ResponseEntity<Void> runConsolidation(
            @RequestParam String companyCode,
            @RequestParam String fiscalPeriod) {
        consolidationService.runConsolidation(companyCode, fiscalPeriod);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/intercompany")
    public ResponseEntity<List<Object>> getIntercompanyEliminations(
            @RequestParam String fiscalPeriod) {
        return ResponseEntity.ok(intercompanyService.getEliminations(fiscalPeriod));
    }
}
