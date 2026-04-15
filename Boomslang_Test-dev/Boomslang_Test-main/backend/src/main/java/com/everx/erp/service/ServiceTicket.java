package com.everx.erp.service;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "service_tickets", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ServiceTicket extends BaseEntity {

    @Column(name = "ticket_number", unique = true, nullable = false, length = 50)
    private String ticketNumber;

    @Column(name = "equipment_id")
    private UUID equipmentId;

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ServiceType type = ServiceType.CORRECTIVE_MAINTENANCE;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ServiceStatus status = ServiceStatus.OPEN;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ServicePriority priority = ServicePriority.MEDIUM;

    @Column(name = "reported_date")
    private LocalDate reportedDate;

    @Column(name = "resolved_date")
    private LocalDate resolvedDate;

    @Column(name = "assigned_to")
    private UUID assignedTo;

    @Column(name = "subcontractor_id")
    private UUID subcontractorId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(precision = 15, scale = 2)
    private BigDecimal cost;

    // Workflow trigger fields
    @Column(name = "is_billable", nullable = false)
    private Boolean billable = false; // Auto-set to true if NOT under warranty

    @Column(name = "is_under_warranty", nullable = false)
    private Boolean underWarranty = false; // Auto-populated from Warranty lookup

    @Column(name = "linked_warranty_id")
    private UUID linkedWarrantyId;

    @Column(name = "linked_invoice_id")
    private UUID linkedInvoiceId; // Auto-set when invoice is created

    @Column(name = "parts_used_ids", columnDefinition = "TEXT[]")
    private UUID[] partsUsedIds; // Array of SparePart IDs consumed
}
