package com.everx.erp.subcontractors;

import com.everx.erp.subcontractors.dto.CreateSubcontractorRequest;
import com.everx.erp.subcontractors.dto.SubcontractorDto;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubcontractorService {

    private final SubcontractorRepository subcontractorRepository;

    @Transactional
    public SubcontractorDto createSubcontractor(CreateSubcontractorRequest request) {
        Subcontractor subcontractor = new Subcontractor();
        subcontractor.setCompanyName(request.getCompanyName());
        subcontractor.setContactName(request.getContactName());
        subcontractor.setEmail(request.getEmail());
        subcontractor.setPhone(request.getPhone());
        subcontractor.setCountry(request.getCountry());
        subcontractor.setCoverageRegions(request.getCoverageRegions());
        subcontractor.setSpecialisations(request.getSpecialisations());
        subcontractor.setHourlyRate(request.getHourlyRate());
        subcontractor.setCurrency(request.getCurrency());
        subcontractor.setNotes(request.getNotes());
        return toDto(subcontractorRepository.save(subcontractor));
    }

    @Transactional(readOnly = true)
    public SubcontractorDto getSubcontractorById(UUID id) {
        return toDto(subcontractorRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Subcontractor not found with id: " + id)));
    }

    @Transactional(readOnly = true)
    public Page<SubcontractorDto> getAllSubcontractors(Pageable pageable) {
        return subcontractorRepository.findAllNotDeleted(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<SubcontractorDto> getSubcontractorsByCountry(String country, Pageable pageable) {
        return subcontractorRepository.findByCountry(country, pageable).map(this::toDto);
    }

    @Transactional
    public SubcontractorDto updateSubcontractor(UUID id, CreateSubcontractorRequest request) {
        Subcontractor subcontractor = subcontractorRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Subcontractor not found with id: " + id));
        if (request.getCompanyName() != null) subcontractor.setCompanyName(request.getCompanyName());
        if (request.getContactName() != null) subcontractor.setContactName(request.getContactName());
        if (request.getEmail() != null) subcontractor.setEmail(request.getEmail());
        if (request.getPhone() != null) subcontractor.setPhone(request.getPhone());
        if (request.getCountry() != null) subcontractor.setCountry(request.getCountry());
        if (request.getCoverageRegions() != null) subcontractor.setCoverageRegions(request.getCoverageRegions());
        if (request.getSpecialisations() != null) subcontractor.setSpecialisations(request.getSpecialisations());
        if (request.getHourlyRate() != null) subcontractor.setHourlyRate(request.getHourlyRate());
        if (request.getCurrency() != null) subcontractor.setCurrency(request.getCurrency());
        if (request.getNotes() != null) subcontractor.setNotes(request.getNotes());
        return toDto(subcontractorRepository.save(subcontractor));
    }

    @Transactional
    public void deleteSubcontractor(UUID id) {
        Subcontractor subcontractor = subcontractorRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Subcontractor not found with id: " + id));
        subcontractor.softDelete();
        subcontractorRepository.save(subcontractor);
    }

    private SubcontractorDto toDto(Subcontractor subcontractor) {
        SubcontractorDto dto = new SubcontractorDto();
        dto.setId(subcontractor.getId());
        dto.setCompanyName(subcontractor.getCompanyName());
        dto.setContactName(subcontractor.getContactName());
        dto.setEmail(subcontractor.getEmail());
        dto.setPhone(subcontractor.getPhone());
        dto.setCountry(subcontractor.getCountry());
        dto.setCoverageRegions(subcontractor.getCoverageRegions());
        dto.setSpecialisations(subcontractor.getSpecialisations());
        dto.setHourlyRate(subcontractor.getHourlyRate());
        dto.setCurrency(subcontractor.getCurrency());
        dto.setNotes(subcontractor.getNotes());
        dto.setCreatedAt(subcontractor.getCreatedAt().toInstant());
        dto.setUpdatedAt(subcontractor.getUpdatedAt().toInstant());
        return dto;
    }
}
