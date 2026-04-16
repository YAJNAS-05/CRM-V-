package com.everx.finance.invoice;

import com.everx.finance.invoice.dto.CreateInvoiceRequest;
import com.everx.finance.invoice.dto.InvoiceResponse;
import com.everx.finance.invoice.dto.UpdateInvoiceRequest;
import com.everx.finance.reversal.DocumentReversalService;
import com.everx.finance.reversal.dto.ReversalRequest;
import com.everx.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/finance/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final DocumentReversalService reversalService;

    @GetMapping
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<Page<InvoiceResponse>> getAllInvoices(Pageable pageable) {
        return ResponseEntity.ok(invoiceService.getAllInvoices(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable UUID id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @GetMapping("/number/{invoiceNumber}")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<InvoiceResponse> getInvoiceByNumber(@PathVariable String invoiceNumber) {
        return ResponseEntity.ok(invoiceService.getInvoiceByNumber(invoiceNumber));
    }

    @GetMapping("/account/{accountId}")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<Page<InvoiceResponse>> getInvoicesByAccount(@PathVariable UUID accountId, Pageable pageable) {
        return ResponseEntity.ok(invoiceService.getInvoicesByAccount(accountId, pageable));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<Page<InvoiceResponse>> getInvoicesByStatus(@PathVariable Invoice.InvoiceStatus status, Pageable pageable) {
        return ResponseEntity.ok(invoiceService.getInvoicesByStatus(status, pageable));
    }

    @GetMapping("/entity/{entity}")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<Page<InvoiceResponse>> getInvoicesByEntity(@PathVariable Invoice.InvoiceEntity entity, Pageable pageable) {
        return ResponseEntity.ok(invoiceService.getInvoicesByEntity(entity, pageable));
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<List<InvoiceResponse>> getOverdueInvoices() {
        return ResponseEntity.ok(invoiceService.getOverdueInvoices());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('FINANCE_CREATE')")
    public ResponseEntity<InvoiceResponse> createInvoice(@RequestBody CreateInvoiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.createInvoice(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('FINANCE_EDIT')")
    public ResponseEntity<InvoiceResponse> updateInvoice(@PathVariable UUID id, @RequestBody UpdateInvoiceRequest request) {
        return ResponseEntity.ok(invoiceService.updateInvoice(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('FINANCE_EDIT')")
    public ResponseEntity<InvoiceResponse> updateInvoiceStatus(@PathVariable UUID id, @RequestParam Invoice.InvoiceStatus status) {
        return ResponseEntity.ok(invoiceService.updateInvoiceStatus(id, status));
    }

    @PostMapping("/{id}/reverse")
    @PreAuthorize("hasAuthority('FINANCE_EDIT')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> reverseInvoice(
            @PathVariable UUID id,
            @RequestBody @Valid ReversalRequest request) {
        Invoice reversalInvoice = reversalService.reverseInvoice(id, request);
        InvoiceResponse response = invoiceService.toResponse(reversalInvoice);
        return ResponseEntity.ok(ApiResponse.ok(response, "Invoice reversed successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('FINANCE_DELETE')")
    public ResponseEntity<Void> deleteInvoice(@PathVariable UUID id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }
}
