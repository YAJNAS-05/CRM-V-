package com.everx.crm.lead;

import com.everx.crm.lead.dto.CreateLeadRequest;
import com.everx.crm.lead.dto.LeadConvertRequest;
import com.everx.crm.lead.dto.LeadDto;
import com.everx.crm.lead.dto.UpdateLeadRequest;
import com.everx.shared.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/crm/leads")
@Validated
@Slf4j
public class LeadController {

    @Autowired
    private LeadService leadService;

    @Autowired
    private LeadConversionService leadConversionService;

    @GetMapping
    @PreAuthorize("hasAuthority('CRM_VIEW')")
    public ResponseEntity<ApiResponse<Page<LeadDto>>> getAllLeads(
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/crm/leads");
        Page<LeadDto> leads = leadService.getAllLeads(pageable);
        return ResponseEntity.ok(ApiResponse.ok(leads, "Leads retrieved successfully"));
    }

    @GetMapping("/{leadId:[0-9a-fA-F-]{36}}")
    @PreAuthorize("hasAuthority('CRM_VIEW')")
    public ResponseEntity<ApiResponse<LeadDto>> getLeadById(@PathVariable UUID leadId) {
        log.info("GET /api/v1/crm/leads/{}", leadId);
        LeadDto lead = leadService.getLeadById(leadId);
        return ResponseEntity.ok(ApiResponse.ok(lead, "Lead retrieved successfully"));
    }

    @GetMapping("/account/{accountId}")
    @PreAuthorize("hasAuthority('CRM_VIEW')")
    public ResponseEntity<ApiResponse<Page<LeadDto>>> getLeadsByAccount(
            @PathVariable UUID accountId,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/crm/leads/account/{}", accountId);
        Page<LeadDto> leads = leadService.getLeadsByAccount(accountId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(leads, "Leads retrieved successfully"));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAuthority('CRM_VIEW')")
    public ResponseEntity<ApiResponse<Page<LeadDto>>> getLeadsByStatus(
            @PathVariable String status,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/crm/leads/status/{}", status);
        Page<LeadDto> leads = leadService.getLeadsByStatus(status, pageable);
        return ResponseEntity.ok(ApiResponse.ok(leads, "Leads retrieved successfully"));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('CRM_VIEW')")
    public ResponseEntity<ApiResponse<Page<LeadDto>>> searchLeads(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "source", required = false) String source,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/crm/leads/search?q={}&status={}&source={}", query, status, source);
        Page<LeadDto> leads = leadService.searchLeads(query, status, source, pageable);
        return ResponseEntity.ok(ApiResponse.ok(leads, "Leads search results"));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CRM_CREATE')")
    public ResponseEntity<ApiResponse<LeadDto>> createLead(@Valid @RequestBody CreateLeadRequest request) {
        log.info("POST /api/v1/crm/leads");
        LeadDto lead = leadService.createLead(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(lead, "Lead created successfully"));
    }

    @PutMapping("/{leadId:[0-9a-fA-F-]{36}}")
    @PreAuthorize("hasAuthority('CRM_EDIT')")
    public ResponseEntity<ApiResponse<LeadDto>> updateLead(
            @PathVariable UUID leadId,
            @Valid @RequestBody UpdateLeadRequest request) {
        log.info("PUT /api/v1/crm/leads/{}", leadId);
        LeadDto lead = leadService.updateLead(leadId, request);
        return ResponseEntity.ok(ApiResponse.ok(lead, "Lead updated successfully"));
    }

    @DeleteMapping("/{leadId:[0-9a-fA-F-]{36}}")
    @PreAuthorize("hasAuthority('CRM_DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteLead(@PathVariable UUID leadId) {
        log.info("DELETE /api/v1/crm/leads/{}", leadId);
        leadService.deleteLead(leadId);
        return ResponseEntity.ok(ApiResponse.okMessage("Lead deleted successfully"));
    }

    @PostMapping("/{leadId:[0-9a-fA-F-]{36}}/convert")
    @PreAuthorize("hasAuthority('CRM_EDIT')")
    public ResponseEntity<ApiResponse<LeadDto>> convertLead(
            @PathVariable UUID leadId,
            @Valid @RequestBody LeadConvertRequest request) {
        log.info("POST /api/v1/crm/leads/{}/convert", leadId);
        LeadDto lead = leadConversionService.convertLead(leadId, request);
        return ResponseEntity.ok(ApiResponse.ok(lead, "Lead converted successfully"));
    }
}
