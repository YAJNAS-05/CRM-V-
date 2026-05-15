package com.everx.erp.service;

import com.everx.erp.equipment.Equipment;
import com.everx.erp.equipment.EquipmentRepository;
import com.everx.erp.equipment.EquipmentStatus;
import com.everx.erp.numbering.DocumentNumberGenerator;
import com.everx.erp.service.dto.CreateServiceTicketRequest;
import com.everx.erp.service.dto.ServiceTicketDto;
import com.everx.erp.spareparts.SparePart;
import com.everx.erp.spareparts.SparePartRepository;
import com.everx.erp.warranty.Warranty;
import com.everx.erp.warranty.WarrantyRepository;
import com.everx.finance.invoice.InvoiceRepository;
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
    private final EquipmentRepository equipmentRepository;
    private final WarrantyRepository warrantyRepository;
    private final SparePartRepository sparePartRepository;
    private final DocumentNumberGenerator documentNumberGenerator;
    private final InvoiceRepository invoiceRepository;

    @Transactional
    public ServiceTicketDto createServiceTicket(CreateServiceTicketRequest request) {
        // WORKFLOW RULE: Service ticket can only be raised against installed equipment
        if (request.getEquipmentId() != null) {
            Equipment equipment = equipmentRepository.findByIdAndNotDeleted(request.getEquipmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Equipment not found with id: " + request.getEquipmentId()));
            if (equipment.getStatus() != EquipmentStatus.INSTALLED) {
                throw new ValidationException(
                        "Service tickets can only be raised for installed equipment. Equipment status is: " + equipment.getStatus());
            }
        }

        ServiceTicket ticket = new ServiceTicket();
        ticket.setTicketNumber(generateServiceTicketNumber());
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
        if (request.getPartsUsedIds() != null) {
            ticket.setPartsUsedIds(request.getPartsUsedIds());
        }

        // WORKFLOW: Auto-lookup active warranty for equipment â†’ determine billable
        if (request.getEquipmentId() != null) {
            resolveWarrantyStatus(ticket, request.getEquipmentId());
        } else {
            ticket.setUnderWarranty(false);
            ticket.setBillable(true);
        }

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
        if (request.getPartsUsedIds() != null) ticket.setPartsUsedIds(request.getPartsUsedIds());

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
     * 1. Deducts spare parts stock for all partsUsedIds
     * 2. If billable (not under warranty), automatically creates an invoice
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

        // WORKFLOW: Auto-deduct spare parts stock for parts consumed during repair
        if (ticket.getPartsUsedIds() != null && ticket.getPartsUsedIds().length > 0) {
            for (UUID partId : ticket.getPartsUsedIds()) {
                sparePartRepository.findByIdAndNotDeleted(partId).ifPresent(part -> {
                    int newQty = Math.max(0, part.getStockQty() - 1);
                    part.setStockQty(newQty);
                    sparePartRepository.save(part);
                });
            }
        }

        // TRIGGER: If billable, create invoice automatically
        if (ticket.getBillable() != null && ticket.getBillable() && ticket.getCost() != null) {
            try {
                CreateInvoiceRequest invoiceRequest = CreateInvoiceRequest.builder()
                        .invoiceNumber(generateInvoiceNumberForServiceTicket(ticket))
                        .accountId(ticket.getAccountId())
                        .type(Invoice.InvoiceType.TAX_INVOICE)
                        .entity(Invoice.InvoiceEntity.AUSTRALIA)
                        .issueDate(LocalDate.now())
                        .dueDate(LocalDate.now().plusDays(30))
                        .currency("AUD")
                        .subtotal(ticket.getCost())
                        .taxAmount(ticket.getCost().multiply(new java.math.BigDecimal("0.10")))
                        .totalAmount(ticket.getCost().multiply(new java.math.BigDecimal("1.10")))
                        .notes("Service ticket repair invoice - Ticket: " + ticket.getTicketNumber())
                        .build();

                var invoiceResponse = invoiceService.createInvoice(invoiceRequest);
                ticket.setLinkedInvoiceId(invoiceResponse.getId());
            } catch (Exception e) {
                System.err.println("Failed to create invoice for service ticket " + ticket.getTicketNumber() + ": " + e.getMessage());
            }
        }

        ServiceTicket saved = serviceTicketRepository.save(ticket);
        return toDto(saved);
    }

    /**
     * WORKFLOW HELPER: Determine warranty status for this equipment at ticket creation time.
     * Sets underWarranty, linkedWarrantyId, and billable on the ticket.
     */
    private void resolveWarrantyStatus(ServiceTicket ticket, UUID equipmentId) {
        List<Warranty> warranties = warrantyRepository.findByEquipmentId(equipmentId);
        Warranty activeWarranty = warranties.stream()
                .filter(w -> "ACTIVE".equalsIgnoreCase(w.getStatus()))
                .filter(w -> {
                    LocalDate reportedDate = ticket.getReportedDate() != null ? ticket.getReportedDate() : LocalDate.now();
                    return !reportedDate.isAfter(w.getEndDate());
                })
                .findFirst()
                .orElse(null);

        if (activeWarranty != null) {
            ticket.setUnderWarranty(true);
            ticket.setLinkedWarrantyId(activeWarranty.getId());
            ticket.setBillable(false);
        } else {
            ticket.setUnderWarranty(false);
            ticket.setBillable(true);
        }
    }

    private String generateInvoiceNumberForServiceTicket(ServiceTicket ticket) {
        return documentNumberGenerator.generate(
                "INV-TKT",
                candidate -> invoiceRepository.findByInvoiceNumberAndIsDeletedFalse(candidate).isPresent()
        );
    }

    private String generateServiceTicketNumber() {
        return documentNumberGenerator.generate(
                "ST",
                candidate -> serviceTicketRepository.findByTicketNumber(candidate).isPresent()
        );
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
        dto.setBillable(ticket.getBillable());
        dto.setUnderWarranty(ticket.getUnderWarranty());
        dto.setLinkedWarrantyId(ticket.getLinkedWarrantyId());
        dto.setLinkedInvoiceId(ticket.getLinkedInvoiceId());
        dto.setPartsUsedIds(ticket.getPartsUsedIds());
        dto.setCreatedAt(ticket.getCreatedAt().toInstant());
        dto.setUpdatedAt(ticket.getUpdatedAt().toInstant());
        return dto;
    }
}
