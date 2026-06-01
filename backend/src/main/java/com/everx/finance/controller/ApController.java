package com.everx.finance.controller;

import com.everx.finance.ap.entity.ApPayment;
import com.everx.finance.ap.entity.VendorInvoice;
import com.everx.finance.service.ApService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/finance/ap")
@RequiredArgsConstructor
public class ApController {
    private final ApService apService;

    @PostMapping("/invoices")
    public ResponseEntity<VendorInvoice> recordInvoice(@RequestBody VendorInvoice invoice) {
        return ResponseEntity.ok(apService.recordInvoice(invoice));
    }

    @PostMapping("/payments")
    public ResponseEntity<ApPayment> recordPayment(@RequestParam UUID invoiceId, @RequestParam BigDecimal amount) {
        return ResponseEntity.ok(apService.recordPayment(invoiceId, amount));
    }

    @GetMapping("/aging")
    public ResponseEntity<List<VendorInvoice>> getAgingReport() {
        return ResponseEntity.ok(apService.getAgingReport());
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<VendorInvoice>> getVendorInvoices(@PathVariable UUID vendorId) {
        return ResponseEntity.ok(apService.getVendorInvoices(vendorId));
    }

    @GetMapping("/payment-schedule")
    public ResponseEntity<List<Object[]>> getPaymentSchedule(@RequestParam LocalDate startDate, @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(apService.getPaymentSchedule(startDate, endDate));
    }
}
