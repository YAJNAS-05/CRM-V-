package com.everx.finance.invoice;

import com.everx.finance.invoice.dto.CreateInvoiceRequest;
import com.everx.finance.invoice.dto.InvoiceResponse;
import com.everx.finance.invoice.dto.UpdateInvoiceRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

    public Page<InvoiceResponse> findAll(Pageable pageable) {
        return invoiceRepository.findAll(pageable).map(this::toResponse);
    }

    public InvoiceResponse findById(UUID id) {
        Invoice invoice = invoiceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Invoice not found"));
        return toResponse(invoice);
    }

    public InvoiceResponse findByNumber(String invoiceNumber) {
        Invoice invoice = invoiceRepository.findByInvoiceNumber(invoiceNumber)
            .orElseThrow(() -> new RuntimeException("Invoice not found"));
        return toResponse(invoice);
    }

    public Page<InvoiceResponse> findByAccountId(UUID accountId, Pageable pageable) {
        return invoiceRepository.findByCustomerId(accountId, pageable).map(this::toResponse);
    }

    public Page<InvoiceResponse> findByStatus(String status, Pageable pageable) {
        return invoiceRepository.findByStatus(status, pageable).map(this::toResponse);
    }

    public Page<InvoiceResponse> findByEntity(String entity, Pageable pageable) {
        return invoiceRepository.findByEntity(entity, pageable).map(this::toResponse);
    }

    public List<InvoiceResponse> findOverdue() {
        return invoiceRepository.findOverdueInvoices(LocalDateTime.now())
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public InvoiceResponse create(CreateInvoiceRequest request) {
        Invoice invoice = Invoice.builder()
            .invoiceNumber(generateInvoiceNumber())
            .customerId(request.getCustomerId())
            .companyCode(request.getCompanyCode())
            .invoiceDate(request.getInvoiceDate())
            .dueDate(request.getDueDate())
            .totalAmount(request.getTotalAmount())
            .taxAmount(request.getTaxAmount())
            .currency(request.getCurrency())
            .status("DRAFT")
            .build();
        return toResponse(invoiceRepository.save(invoice));
    }

    @Transactional
    public InvoiceResponse update(UUID id, UpdateInvoiceRequest request) {
        Invoice invoice = invoiceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Invoice not found"));
        invoice.setInvoiceDate(request.getInvoiceDate());
        invoice.setDueDate(request.getDueDate());
        invoice.setTotalAmount(request.getTotalAmount());
        invoice.setTaxAmount(request.getTaxAmount());
        invoice.setCurrency(request.getCurrency());
        return toResponse(invoiceRepository.save(invoice));
    }

    @Transactional
    public InvoiceResponse updateStatus(UUID id, String status) {
        Invoice invoice = invoiceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Invoice not found"));
        invoice.setStatus(status);
        return toResponse(invoiceRepository.save(invoice));
    }

    @Transactional
    public void delete(UUID id) {
        invoiceRepository.deleteById(id);
    }

    private String generateInvoiceNumber() {
        return "INV-" + System.currentTimeMillis();
    }

    private InvoiceResponse toResponse(Invoice invoice) {
        return InvoiceResponse.builder()
            .id(invoice.getId())
            .invoiceNumber(invoice.getInvoiceNumber())
            .customerId(invoice.getCustomerId())
            .companyCode(invoice.getCompanyCode())
            .invoiceDate(invoice.getInvoiceDate())
            .dueDate(invoice.getDueDate())
            .totalAmount(invoice.getTotalAmount())
            .taxAmount(invoice.getTaxAmount())
            .openAmount(invoice.getTotalAmount())
            .currency(invoice.getCurrency())
            .status(invoice.getStatus())
            .build();
    }
}
