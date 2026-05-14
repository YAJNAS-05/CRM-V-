package com.everx.erp.service.dto;

import com.everx.erp.service.ServicePriority;
import com.everx.erp.service.ServiceStatus;
import com.everx.erp.service.ServiceType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateServiceTicketRequest {
    @Size(max = 50)
    private String ticketNumber;
    private UUID equipmentId;
    @NotNull(message = "Account ID is required")
    private UUID accountId;
    @NotNull(message = "Type is required")
    private ServiceType type;
    @NotNull(message = "Status is required")
    private ServiceStatus status;
    @NotNull(message = "Priority is required")
    private ServicePriority priority;
    private LocalDate reportedDate;
    private LocalDate resolvedDate;
    private UUID assignedTo;
    private UUID subcontractorId;
    private String description;
    private String resolutionNotes;
    private BigDecimal cost;
    private UUID[] partsUsedIds;
}
