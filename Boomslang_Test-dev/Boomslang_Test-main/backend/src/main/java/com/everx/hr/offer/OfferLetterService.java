package com.everx.hr.offer;

import com.everx.hr.offer.dto.CreateOfferLetterRequest;
import com.everx.hr.offer.dto.OfferLetterDto;
import com.everx.hr.offer.dto.UpdateOfferLetterRequest;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OfferLetterService {

    private final OfferLetterRepository offerLetterRepository;

    @Transactional
    public OfferLetterDto create(CreateOfferLetterRequest request) {
        OfferLetter offer = new OfferLetter();
        offer.setPositionId(request.getPositionId());
        offer.setCandidateName(request.getCandidateName());
        offer.setCandidateEmail(request.getCandidateEmail());
        offer.setOfferDate(request.getOfferDate());
        offer.setExpiryDate(request.getExpiryDate());
        offer.setSalary(request.getSalary());
        offer.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
        offer.setDepartmentId(request.getDepartmentId());
        offer.setNotes(request.getNotes());
        offer.setStatus(OfferLetterStatus.DRAFT);
        return toDto(offerLetterRepository.save(offer));
    }

    @Transactional(readOnly = true)
    public OfferLetterDto getById(UUID id) {
        return toDto(offerLetterRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Offer letter not found: " + id)));
    }

    @Transactional(readOnly = true)
    public Page<OfferLetterDto> getAll(Pageable pageable, String search, OfferLetterStatus status) {
        return offerLetterRepository.findAllFiltered(search, status, pageable).map(this::toDto);
    }

    @Transactional
    public OfferLetterDto update(UUID id, UpdateOfferLetterRequest request) {
        OfferLetter offer = offerLetterRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Offer letter not found: " + id));

        if (request.getPositionId() != null) offer.setPositionId(request.getPositionId());
        if (request.getCandidateName() != null) offer.setCandidateName(request.getCandidateName());
        if (request.getCandidateEmail() != null) offer.setCandidateEmail(request.getCandidateEmail());
        if (request.getOfferDate() != null) offer.setOfferDate(request.getOfferDate());
        if (request.getExpiryDate() != null) offer.setExpiryDate(request.getExpiryDate());
        if (request.getSalary() != null) offer.setSalary(request.getSalary());
        if (request.getCurrency() != null) offer.setCurrency(request.getCurrency());
        if (request.getDepartmentId() != null) offer.setDepartmentId(request.getDepartmentId());
        if (request.getNotes() != null) offer.setNotes(request.getNotes());
        if (request.getStatus() != null) offer.setStatus(request.getStatus());

        return toDto(offerLetterRepository.save(offer));
    }

    @Transactional
    public void delete(UUID id) {
        OfferLetter offer = offerLetterRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Offer letter not found: " + id));
        offer.softDelete();
        offerLetterRepository.save(offer);
    }

    private OfferLetterDto toDto(OfferLetter o) {
        OfferLetterDto dto = new OfferLetterDto();
        dto.setId(o.getId());
        dto.setPositionId(o.getPositionId());
        dto.setCandidateName(o.getCandidateName());
        dto.setCandidateEmail(o.getCandidateEmail());
        dto.setOfferDate(o.getOfferDate());
        dto.setExpiryDate(o.getExpiryDate());
        dto.setSalary(o.getSalary());
        dto.setCurrency(o.getCurrency());
        dto.setDepartmentId(o.getDepartmentId());
        dto.setNotes(o.getNotes());
        dto.setStatus(o.getStatus());
        dto.setCreatedAt(o.getCreatedAt());
        dto.setUpdatedAt(o.getUpdatedAt());
        return dto;
    }
}
