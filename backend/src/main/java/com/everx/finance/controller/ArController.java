package com.everx.finance.controller;

import com.everx.finance.ar.entity.ArCreditLimit;
import com.everx.finance.ar.entity.ArPayment;
import com.everx.finance.ar.entity.CustomerInvoice;
import com.everx.finance.service.ArService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/finance/ar")
@RequiredArgsConstructor
public class ArController {
    private final ArService arService;

    @PostMapping("/invoices")
    public ResponseEntity<CustomerInvoice> createInvoice(@RequestBody CustomerInvoice invoice) {
        return ResponseEntity.ok(arService.createInvoice(invoice));
    }

    @PostMapping("/payments")
    public ResponseEntity<ArPayment> recordPayment(@RequestParam UUID invoiceId, @RequestParam BigDecimal amount) {
        return ResponseEntity.ok(arService.recordPayment(invoiceId, amount));
    }

    @GetMapping("/aging")
    public ResponseEntity<List<CustomerInvoice>> getAgingReport() {
        return ResponseEntity.ok(arService.getAgingReport());
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<CustomerInvoice>> getCustomerInvoices(@PathVariable UUID customerId) {
        return ResponseEntity.ok(arService.getCustomerInvoices(customerId));
    }

    @PutMapping("/credit-limits/{customerId}")
    public ResponseEntity<ArCreditLimit> updateCreditLimit(@PathVariable UUID customerId, @RequestParam BigDecimal newLimit) {
        return ResponseEntity.ok(arService.updateCreditLimit(customerId, newLimit));
    }
}
