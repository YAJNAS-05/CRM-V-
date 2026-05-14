package com.everx.hr.document;

import com.everx.hr.document.dto.CreateHrDocumentRequest;
import com.everx.hr.document.dto.HrDocumentDto;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HrDocumentService {

    private final HrDocumentRepository documentRepository;

    @Transactional
    public HrDocumentDto create(CreateHrDocumentRequest request) {
        HrDocument doc = new HrDocument();
        doc.setEmployeeId(request.getEmployeeId());
        doc.setDocumentType(request.getDocumentType());
        doc.setFileName(request.getFileName());
        doc.setFileUrl(request.getFileUrl());
        doc.setUploadedAt(OffsetDateTime.now());
        doc.setIsVerified(false);
        doc.setNotes(request.getNotes());
        return toDto(documentRepository.save(doc));
    }

    @Transactional(readOnly = true)
    public HrDocumentDto getById(UUID id) {
        return toDto(documentRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Document not found: " + id)));
    }

    @Transactional(readOnly = true)
    public Page<HrDocumentDto> getAll(Pageable pageable, UUID employeeId, String documentType) {
        return documentRepository.findAllFiltered(employeeId, documentType, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<HrDocumentDto> getByEmployee(UUID employeeId) {
        return documentRepository.findByEmployeeId(employeeId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public HrDocumentDto verify(UUID id) {
        HrDocument doc = documentRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Document not found: " + id));
        doc.setIsVerified(true);
        return toDto(documentRepository.save(doc));
    }

    @Transactional
    public void delete(UUID id) {
        HrDocument doc = documentRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Document not found: " + id));
        doc.softDelete();
        documentRepository.save(doc);
    }

    private HrDocumentDto toDto(HrDocument d) {
        HrDocumentDto dto = new HrDocumentDto();
        dto.setId(d.getId());
        dto.setEmployeeId(d.getEmployeeId());
        dto.setDocumentType(d.getDocumentType());
        dto.setFileName(d.getFileName());
        dto.setFileUrl(d.getFileUrl());
        dto.setUploadedAt(d.getUploadedAt());
        dto.setIsVerified(d.getIsVerified());
        dto.setNotes(d.getNotes());
        dto.setCreatedAt(d.getCreatedAt());
        dto.setUpdatedAt(d.getUpdatedAt());
        return dto;
    }
}
