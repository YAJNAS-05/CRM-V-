package com.everx.erp.service;

import com.everx.erp.service.dto.ServiceTicketDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

/**
 * Service Ticket Workflow Endpoints
 * Manages service ticket lifecycle and workflow triggers
 * 
 * Base Path: /api/v1/service-tickets
 */
@RestController
@RequestMapping("/api/v1/service-tickets")
@RequiredArgsConstructor
public class ServiceTicketWorkflowController {

    private final ServiceTicketService serviceTicketService;

    /**
     * WORKFLOW TRIGGER: Resolve Service Ticket
     * Changes ticket status to RESOLVED
     * If billable, automatically creates an Invoice for the repair cost
     * 
     * POST /api/v1/service-tickets/{ticketId}/resolve
     */
    @PostMapping("/{ticketId}/resolve")
    public ResponseEntity<?> resolveServiceTicket(
            @PathVariable UUID ticketId,
            @RequestParam(required = false) String resolutionNotes) {
        try {
            ServiceTicketDto resolvedTicket = serviceTicketService.resolveServiceTicket(ticketId, resolutionNotes);
            return ResponseEntity.ok(new TicketResolutionResponse(
                    "success",
                    "Service ticket resolved",
                    resolvedTicket,
                    resolvedTicket.getId() != null ? 
                        "Invoice may have been created if ticket is billable" : null
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new TicketResolutionResponse("error", e.getMessage(), null, null));
        }
    }

    /**
     * Response DTO for ticket resolution
     */
    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class TicketResolutionResponse {
        private String status;
        private String message;
        private ServiceTicketDto ticket;
        private String additionalInfo;
    }
}
