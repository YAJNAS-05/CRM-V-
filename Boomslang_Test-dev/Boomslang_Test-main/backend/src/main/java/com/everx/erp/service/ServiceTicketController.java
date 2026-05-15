package com.everx.erp.service;

import com.everx.erp.service.dto.CreateServiceTicketRequest;
import com.everx.erp.service.dto.ServiceTicketDto;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/erp/service-tickets")
@RequiredArgsConstructor
public class ServiceTicketController {

    private final ServiceTicketService serviceTicketService;

    @PostMapping
    public ResponseEntity<ApiResponse<ServiceTicketDto>> createServiceTicket(@Valid @RequestBody CreateServiceTicketRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(serviceTicketService.createServiceTicket(request), "Service ticket created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceTicketDto>> getServiceTicketById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(serviceTicketService.getServiceTicketById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ServiceTicketDto>>> getAllServiceTickets(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(serviceTicketService.getAllServiceTickets(pageable)));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<Page<ServiceTicketDto>>> getServiceTicketsByStatus(@PathVariable ServiceStatus status, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(serviceTicketService.getServiceTicketsByStatus(status, pageable)));
    }

    @GetMapping("/priority/{priority}")
    public ResponseEntity<ApiResponse<Page<ServiceTicketDto>>> getServiceTicketsByPriority(@PathVariable ServicePriority priority, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(serviceTicketService.getServiceTicketsByPriority(priority, pageable)));
    }

    @GetMapping("/assigned/{userId}")
    public ResponseEntity<ApiResponse<Page<ServiceTicketDto>>> getServiceTicketsByAssignedTo(@PathVariable UUID userId, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(serviceTicketService.getServiceTicketsByAssignedTo(userId, pageable)));
    }

    @GetMapping("/open")
    public ResponseEntity<ApiResponse<List<ServiceTicketDto>>> getOpenServiceTickets() {
        return ResponseEntity.ok(ApiResponse.ok(serviceTicketService.getOpenServiceTickets()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceTicketDto>> updateServiceTicket(@PathVariable UUID id, @Valid @RequestBody CreateServiceTicketRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(serviceTicketService.updateServiceTicket(id, request), "Service ticket updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteServiceTicket(@PathVariable UUID id) {
        serviceTicketService.deleteServiceTicket(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Service ticket deleted successfully"));
    }
}
