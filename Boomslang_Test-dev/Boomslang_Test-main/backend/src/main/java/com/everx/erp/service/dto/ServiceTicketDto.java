package com.everx.erp.service.dto;

import com.everx.erp.service.ServicePriority;
import com.everx.erp.service.ServiceStatus;
import com.everx.erp.service.ServiceType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceTicketDto {
    private UUID id;
    private String ticketNumber;
    private UUID equipmentId;
    private UUID accountId;
    private ServiceType type;
    private ServiceStatus status;
    private ServicePriority priority;
    private LocalDate reportedDate;
    private LocalDate resolvedDate;
    private UUID assignedTo;
    private UUID subcontractorId;
    private String description;
    private String resolutionNotes;
    private BigDecimal cost;
    private Instant createdAt;
    private Instant updatedAt;
}
