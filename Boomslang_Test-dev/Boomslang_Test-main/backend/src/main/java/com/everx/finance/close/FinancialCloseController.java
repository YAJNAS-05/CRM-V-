package com.everx.finance.close;

import com.everx.finance.close.dto.ThreeWayMatchException;
import com.everx.finance.close.dto.ResolveMatchExceptionRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/financial-close")
@RequiredArgsConstructor
public class FinancialCloseController {

    private final FinancialCloseService service;

    @GetMapping("/exceptions")
    public ResponseEntity<List<ThreeWayMatchException>> getExceptions(
            @RequestParam(required = false) String companyCode,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(service.getExceptions(companyCode, status));
    }

    @PostMapping("/exceptions/{id}/resolve")
    public ResponseEntity<ThreeWayMatchException> resolveException(
            @PathVariable UUID id,
            @RequestBody ResolveMatchExceptionRequest request) {
        return ResponseEntity.ok(service.resolveException(id, request));
    }

    @PostMapping("/period/{companyCode}/close")
    public ResponseEntity<Void> closePeriod(@PathVariable String companyCode, @RequestParam String period) {
        service.closePeriod(companyCode, period);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/period/{companyCode}/reopen")
    public ResponseEntity<Void> reopenPeriod(@PathVariable String companyCode, @RequestParam String period) {
        service.reopenPeriod(companyCode, period);
        return ResponseEntity.ok().build();
    }
}
