package com.everx.finance.invoice;

import com.everx.finance.invoice.dto.CreateInvoiceRequest;
import com.everx.finance.invoice.dto.InvoiceResponse;
import com.everx.finance.invoice.dto.UpdateInvoiceRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/finance/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<Page<InvoiceResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(invoiceService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(invoiceService.findById(id));
    }

    @GetMapping("/number/{invoiceNumber}")
    public ResponseEntity<InvoiceResponse> getByNumber(@PathVariable String invoiceNumber) {
        return ResponseEntity.ok(invoiceService.findByNumber(invoiceNumber));
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<Page<InvoiceResponse>> getByAccount(@PathVariable UUID accountId, Pageable pageable) {
        return ResponseEntity.ok(invoiceService.findByAccountId(accountId, pageable));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Page<InvoiceResponse>> getByStatus(@PathVariable String status, Pageable pageable) {
        return ResponseEntity.ok(invoiceService.findByStatus(status, pageable));
    }

    @GetMapping("/entity/{entity}")
    public ResponseEntity<Page<InvoiceResponse>> getByEntity(@PathVariable String entity, Pageable pageable) {
        return ResponseEntity.ok(invoiceService.findByEntity(entity, pageable));
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<InvoiceResponse>> getOverdue() {
        return ResponseEntity.ok(invoiceService.findOverdue());
    }

    @PostMapping
    public ResponseEntity<InvoiceResponse> create(@RequestBody CreateInvoiceRequest request) {
        return ResponseEntity.ok(invoiceService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvoiceResponse> update(@PathVariable UUID id, @RequestBody UpdateInvoiceRequest request) {
        return ResponseEntity.ok(invoiceService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<InvoiceResponse> updateStatus(@PathVariable UUID id, @RequestParam String status) {
        return ResponseEntity.ok(invoiceService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        invoiceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
