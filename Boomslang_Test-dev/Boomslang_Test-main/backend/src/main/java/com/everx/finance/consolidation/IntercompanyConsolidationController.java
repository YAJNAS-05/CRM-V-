package com.everx.finance.consolidation;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/intercompany")
@RequiredArgsConstructor
public class IntercompanyConsolidationController {

    public List<Object> getEliminations(String fiscalPeriod) {
        return List.of();
    }

    @PostMapping("/eliminate")
    public void runEliminations(@RequestParam String fiscalPeriod) {
    }
}
