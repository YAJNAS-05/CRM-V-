package com.everx.hr.document;

import com.everx.hr.document.dto.CreateHrDocumentRequest;
import com.everx.hr.document.dto.HrDocumentDto;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr/documents")
@RequiredArgsConstructor
public class HrDocumentController {

    private final HrDocumentService documentService;

    @PostMapping
    @PreAuthorize("hasAuthority('HR_DOCUMENT_CREATE')")
    public ResponseEntity<ApiResponse<HrDocumentDto>> create(@Valid @RequestBody CreateHrDocumentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(documentService.create(request), "Document uploaded successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('HR_DOCUMENT_VIEW')")
    public ResponseEntity<ApiResponse<HrDocumentDto>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(documentService.getById(id)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('HR_DOCUMENT_VIEW')")
    public ResponseEntity<ApiResponse<Page<HrDocumentDto>>> getAll(
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) String documentType,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(documentService.getAll(pageable, employeeId, documentType)));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAuthority('HR_DOCUMENT_VIEW')")
    public ResponseEntity<ApiResponse<List<HrDocumentDto>>> getByEmployee(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(ApiResponse.ok(documentService.getByEmployee(employeeId)));
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasAuthority('HR_DOCUMENT_VERIFY')")
    public ResponseEntity<ApiResponse<HrDocumentDto>> verify(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(documentService.verify(id), "Document verified"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('HR_DOCUMENT_DELETE')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        documentService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Document deleted successfully"));
    }
}
