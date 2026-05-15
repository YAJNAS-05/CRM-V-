package com.everx.erp.fieldwork;

import com.everx.erp.fieldwork.dto.FieldJobChecklistDto;
import com.everx.erp.fieldwork.dto.FieldJobCostDto;
import com.everx.erp.fieldwork.dto.FieldJobReportDto;
import com.everx.erp.fieldwork.dto.FieldJobSignOffDto;
import com.everx.erp.fieldwork.dto.FieldJobTravelDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/field-jobs")
@RequiredArgsConstructor
public class FieldJobOperationsController {

    private final FieldJobOperationsService operationsService;

    @GetMapping("/urgent")
    @PreAuthorize("hasAnyAuthority('FIELDWORK_VIEW', 'FIELDWORK_CREATE', 'FIELDWORK_EDIT')")
    public List<com.everx.erp.fieldwork.dto.FieldJobDto> getUrgentJobs() {
        return operationsService.getUrgentJobs();
    }

    @PostMapping("/{jobId}/costs")
    @PreAuthorize("hasAuthority('FIELDWORK_EDIT')")
    public FieldJobCostDto addCost(@PathVariable UUID jobId, @RequestBody FieldJobCostDto request) {
        return operationsService.addCost(jobId, request);
    }

    @GetMapping("/{jobId}/costs")
    @PreAuthorize("hasAnyAuthority('FIELDWORK_VIEW', 'FIELDWORK_CREATE', 'FIELDWORK_EDIT')")
    public List<FieldJobCostDto> getCosts(@PathVariable UUID jobId) {
        return operationsService.getCosts(jobId);
    }

    @PutMapping("/{jobId}/costs/{costId}")
    @PreAuthorize("hasAuthority('FIELDWORK_EDIT')")
    public FieldJobCostDto updateCost(@PathVariable UUID jobId, @PathVariable Long costId, @RequestBody FieldJobCostDto request) {
        return operationsService.updateCost(jobId, costId, request);
    }

    @PostMapping("/{jobId}/travel")
    @PreAuthorize("hasAuthority('FIELDWORK_EDIT')")
    public FieldJobTravelDto addTravel(@PathVariable UUID jobId, @RequestBody FieldJobTravelDto request) {
        return operationsService.addTravel(jobId, request);
    }

    @GetMapping("/{jobId}/travel")
    @PreAuthorize("hasAnyAuthority('FIELDWORK_VIEW', 'FIELDWORK_CREATE', 'FIELDWORK_EDIT')")
    public List<FieldJobTravelDto> getTravel(@PathVariable UUID jobId) {
        return operationsService.getTravel(jobId);
    }

    @GetMapping("/{jobId}/checklist")
    @PreAuthorize("hasAnyAuthority('FIELDWORK_VIEW', 'FIELDWORK_CREATE', 'FIELDWORK_EDIT')")
    public FieldJobChecklistDto getChecklist(@PathVariable UUID jobId) {
        return operationsService.getChecklist(jobId);
    }

    @PostMapping("/{jobId}/checklist/submit")
    @PreAuthorize("hasAuthority('FIELDWORK_EDIT')")
    public FieldJobChecklistDto submitChecklist(@PathVariable UUID jobId, @RequestBody FieldJobChecklistDto request) {
        return operationsService.submitChecklist(jobId, request);
    }

    @GetMapping("/{jobId}/report")
    @PreAuthorize("hasAnyAuthority('FIELDWORK_VIEW', 'FIELDWORK_CREATE', 'FIELDWORK_EDIT')")
    public FieldJobReportDto getReport(@PathVariable UUID jobId) {
        return operationsService.getReport(jobId);
    }

    @GetMapping("/{jobId}/report/pdf")
    @PreAuthorize("hasAnyAuthority('FIELDWORK_VIEW', 'FIELDWORK_CREATE', 'FIELDWORK_EDIT')")
    public ResponseEntity<byte[]> downloadReportPdf(@PathVariable UUID jobId) {
        byte[] bytes = operationsService.getReportPdf(jobId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename("field-job-report-" + jobId + ".pdf").build().toString())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(bytes);
    }

    @PostMapping("/{jobId}/sign-off")
    @PreAuthorize("hasAuthority('FIELDWORK_EDIT')")
    public com.everx.erp.fieldwork.dto.FieldJobDto processSignOff(@PathVariable UUID jobId, @RequestBody FieldJobSignOffDto request) {
        return operationsService.processSignOff(jobId, request);
    }
}