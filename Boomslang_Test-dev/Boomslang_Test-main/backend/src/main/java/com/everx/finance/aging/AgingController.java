package com.everx.finance.aging;

import com.everx.finance.aging.dto.ArAgingReportDto;
import com.everx.finance.aging.dto.ArCustomerAgingDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/aging")
@RequiredArgsConstructor
public class AgingController {

    private final AccountsReceivableAgingService service;

    @GetMapping("/ar")
    public ResponseEntity<List<ArAgingReportDto>> getARAgingReport(
            @RequestParam(required = false) String companyCode,
            @RequestParam(required = false) UUID customerId) {
        return ResponseEntity.ok(service.generateARAgingReport(companyCode, customerId));
    }

    @GetMapping("/ar/customer/{customerId}")
    public ResponseEntity<ArCustomerAgingDto> getCustomerAging(@PathVariable UUID customerId) {
        return ResponseEntity.ok(service.getCustomerAging(customerId));
    }

    @PostMapping("/ar/refresh")
    public ResponseEntity<Void> refreshAging(@RequestParam String companyCode) {
        service.refreshAgingData(companyCode);
        return ResponseEntity.ok().build();
    }
}
