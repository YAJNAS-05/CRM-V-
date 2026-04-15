package com.everx.erp.service;

import com.everx.erp.service.dto.CreateServiceTicketRequest;
import com.everx.erp.service.dto.ServiceTicketDto;
import com.everx.finance.invoice.InvoiceService;
import com.everx.finance.invoice.dto.CreateInvoiceRequest;
import com.everx.finance.invoice.Invoice;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceTicketService {

    private final ServiceTicketRepository serviceTicketRepository;
    private final InvoiceService invoiceService;

    @Transactional
    public ServiceTicketDto createServiceTicket(CreateServiceTicketRequest request) {
        if (serviceTicketRepository.findByTicketNumber(request.getTicketNumber()).isPresent()) {
            throw new ValidationException("Service ticket with ticket number " + request.getTicketNumber() + " already exists");
        }

        ServiceTicket ticket = new ServiceTicket();
        ticket.setTicketNumber(request.getTicketNumber());
        ticket.setEquipmentId(request.getEquipmentId());
        ticket.setAccountId(request.getAccountId());
        ticket.setType(request.getType());
        ticket.setStatus(request.getStatus());
        ticket.setPriority(request.getPriority());
        ticket.setReportedDate(request.getReportedDate());
        ticket.setResolvedDate(request.getResolvedDate());
        ticket.setAssignedTo(request.getAssignedTo());
        ticket.setSubcontractorId(request.getSubcontractorId());
        ticket.setDescription(request.getDescription());
        ticket.setResolutionNotes(request.getResolutionNotes());
        ticket.setCost(request.getCost());

        return toDto(Objects.requireNonNull(serviceTicketRepository.save(ticket), "Repository save returned null"));
    }

    @Transactional(readOnly = true)
    public ServiceTicketDto getServiceTicketById(UUID id) {
        return toDto(serviceTicketRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Service ticket not found with id: " + id)));
    }

    @Transactional(readOnly = true)
    public Page<ServiceTicketDto> getAllServiceTickets(Pageable pageable) {
        return serviceTicketRepository.findAllNotDeleted(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ServiceTicketDto> getServiceTicketsByStatus(ServiceStatus status, Pageable pageable) {
        return serviceTicketRepository.findByStatus(status, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ServiceTicketDto> getServiceTicketsByPriority(ServicePriority priority, Pageable pageable) {
        return serviceTicketRepository.findByPriority(priority, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<ServiceTicketDto> getServiceTicketsByAssignedTo(UUID userId, Pageable pageable) {
        return serviceTicketRepository.findByAssignedTo(userId, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<ServiceTicketDto> getOpenServiceTickets() {
        return serviceTicketRepository.findOpenTickets().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public ServiceTicketDto updateServiceTicket(UUID id, CreateServiceTicketRequest request) {
        ServiceTicket ticket = serviceTicketRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Service ticket not found with id: " + id));

        if (request.getTicketNumber() != null && !request.getTicketNumber().equals(ticket.getTicketNumber())) {
            if (serviceTicketRepository.findByTicketNumber(request.getTicketNumber()).isPresent()) {
                throw new ValidationException("Service ticket with ticket number " + request.getTicketNumber() + " already exists");
            }
            ticket.setTicketNumber(request.getTicketNumber());
        }

        if (request.getEquipmentId() != null) ticket.setEquipmentId(request.getEquipmentId());
        if (request.getAccountId() != null) ticket.setAccountId(request.getAccountId());
        if (request.getType() != null) ticket.setType(request.getType());
        if (request.getStatus() != null) ticket.setStatus(request.getStatus());
        if (request.getPriority() != null) ticket.setPriority(request.getPriority());
        if (request.getReportedDate() != null) ticket.setReportedDate(request.getReportedDate());
        if (request.getResolvedDate() != null) ticket.setResolvedDate(request.getResolvedDate());
        if (request.getAssignedTo() != null) ticket.setAssignedTo(request.getAssignedTo());
        if (request.getSubcontractorId() != null) ticket.setSubcontractorId(request.getSubcontractorId());
        if (request.getDescription() != null) ticket.setDescription(request.getDescription());
        if (request.getResolutionNotes() != null) ticket.setResolutionNotes(request.getResolutionNotes());
        if (request.getCost() != null) ticket.setCost(request.getCost());

        return toDto(Objects.requireNonNull(serviceTicketRepository.save(ticket)));
    }

    @Transactional
    public void deleteServiceTicket(UUID id) {
        ServiceTicket ticket = serviceTicketRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Service ticket not found with id: " + id));
        ticket.softDelete();
        serviceTicketRepository.save(ticket);
    }

    /**
     * WORKFLOW TRIGGER: Resolve service ticket
     * If ticket is billable (not under warranty), automatically creates an invoice
     * Parts used are decremented from inventory (future enhancement)
     */
    @Transactional
    public ServiceTicketDto resolveServiceTicket(UUID id, String resolutionNotes) {
        ServiceTicket ticket = serviceTicketRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Service ticket not found with id: " + id));

        // Update ticket status to resolved
        ticket.setStatus(ServiceStatus.RESOLVED);
        ticket.setResolvedDate(LocalDate.now());
        if (resolutionNotes != null) {
            ticket.setResolutionNotes(resolutionNotes);
        }

        // TRIGGER: If billable, create invoice automatically
        if (ticket.getBillable() != null && ticket.getBillable()) {
            try {
                CreateInvoiceRequest invoiceRequest = CreateInvoiceRequest.builder()
                        .invoiceNumber(generateInvoiceNumberForServiceTicket(ticket))
                        .accountId(ticket.getAccountId())
                        .type(Invoice.InvoiceType.TAX_INVOICE)
                        .entity(Invoice.InvoiceEntity.AUSTRALIA) // Default to AU; should be configurable
                        .issueDate(LocalDate.now())
                        .dueDate(LocalDate.now().plusDays(30))
                        .currency("AUD")
                        .subtotal(ticket.getCost())
                        .taxAmount(ticket.getCost().multiply(new java.math.BigDecimal("0.10"))) // 10% GST
                        .totalAmount(ticket.getCost().multiply(new java.math.BigDecimal("1.10")))
                        .notes("Service ticket repair invoice - Ticket: " + ticket.getTicketNumber())
                        .build();

                var invoiceResponse = invoiceService.createInvoice(invoiceRequest);
                ticket.setLinkedInvoiceId(invoiceResponse.getId());
            } catch (Exception e) {
                // Log error but don't fail ticket resolution
                System.err.println("Failed to create invoice for service ticket " + ticket.getTicketNumber() + ": " + e.getMessage());
            }
        }

        ServiceTicket saved = serviceTicketRepository.save(ticket);
        return toDto(saved);
    }

    private String generateInvoiceNumberForServiceTicket(ServiceTicket ticket) {
        // Generate invoice number based on ticket: INV-TKT-{TICKET_NUMBER}
        return "INV-TKT-" + ticket.getTicketNumber();
    }

    private ServiceTicketDto toDto(ServiceTicket ticket) {
        ServiceTicketDto dto = new ServiceTicketDto();
        dto.setId(ticket.getId());
        dto.setTicketNumber(ticket.getTicketNumber());
        dto.setEquipmentId(ticket.getEquipmentId());
        dto.setAccountId(ticket.getAccountId());
        dto.setType(ticket.getType());
        dto.setStatus(ticket.getStatus());
        dto.setPriority(ticket.getPriority());
        dto.setReportedDate(ticket.getReportedDate());
        dto.setResolvedDate(ticket.getResolvedDate());
        dto.setAssignedTo(ticket.getAssignedTo());
        dto.setSubcontractorId(ticket.getSubcontractorId());
        dto.setDescription(ticket.getDescription());
        dto.setResolutionNotes(ticket.getResolutionNotes());
        dto.setCost(ticket.getCost());
        dto.setCreatedAt(ticket.getCreatedAt().toInstant());
        dto.setUpdatedAt(ticket.getUpdatedAt().toInstant());
        return dto;
    }
}
