package com.everx.hr.reimbursement;

import com.everx.finance.journal.GlPostingService;
import com.everx.hr.ReimbursementStatus;
import com.everx.hr.reimbursement.dto.CreateReimbursementRequest;
import com.everx.hr.reimbursement.dto.ReimbursementRequestDto;
import com.everx.hr.reimbursement.dto.UpdateReimbursementRequest;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReimbursementService {

    private final ReimbursementRepository reimbursementRepository;
    private final GlPostingService glPostingService;

    @Transactional
    public ReimbursementRequestDto createReimbursement(CreateReimbursementRequest request) {
        if (request.getAmount() == null || request.getAmount().signum() <= 0) {
            throw new ValidationException("Reimbursement amount must be greater than zero");
        }

        ReimbursementRequest reimbursement = new ReimbursementRequest();
        reimbursement.setRequestedBy(request.getRequestedBy());
        reimbursement.setRequesterEmail(request.getRequesterEmail());
        reimbursement.setAmount(request.getAmount());
        reimbursement.setCurrency(request.getCurrency());
        reimbursement.setCategory(request.getCategory());
        reimbursement.setRequestDate(request.getRequestDate());
        reimbursement.setDescription(request.getDescription());
        reimbursement.setStatus(ReimbursementStatus.SUBMITTED);

        return toDto(reimbursementRepository.save(reimbursement));
    }

    @Transactional(readOnly = true)
    public ReimbursementRequestDto getReimbursement(UUID id) {
        ReimbursementRequest reimbursement = reimbursementRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Reimbursement not found with id: " + id));
        return toDto(reimbursement);
    }

    @Transactional(readOnly = true)
    public Page<ReimbursementRequestDto> getReimbursements(Pageable pageable,
                                                           String search,
                                                           ReimbursementStatus status,
                                                           UUID requestedBy,
                                                           java.time.LocalDate startDate,
                                                           java.time.LocalDate endDate) {
        return reimbursementRepository.findAllFiltered(search, status, requestedBy, startDate, endDate, pageable)
                .map(this::toDto);
    }

    @Transactional
    public ReimbursementRequestDto updateReimbursement(UUID id, UpdateReimbursementRequest request) {
        ReimbursementRequest reimbursement = reimbursementRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Reimbursement not found with id: " + id));

        if (request.getAmount() != null && request.getAmount().signum() <= 0) {
            throw new ValidationException("Reimbursement amount must be greater than zero");
        }

        if (request.getAmount() != null) reimbursement.setAmount(request.getAmount());
        if (request.getCurrency() != null) reimbursement.setCurrency(request.getCurrency());
        if (request.getCategory() != null) reimbursement.setCategory(request.getCategory());
        if (request.getRequestDate() != null) reimbursement.setRequestDate(request.getRequestDate());
        if (request.getDescription() != null) reimbursement.setDescription(request.getDescription());
        if (request.getStatus() != null) reimbursement.setStatus(request.getStatus());
        if (request.getNotes() != null) reimbursement.setNotes(request.getNotes());

        return toDto(reimbursementRepository.save(reimbursement));
    }

    @Transactional
    public ReimbursementRequestDto approveReimbursement(UUID id, UUID approvedBy) {
        ReimbursementRequest reimbursement = reimbursementRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Reimbursement not found with id: " + id));
        reimbursement.setStatus(ReimbursementStatus.APPROVED);
        reimbursement.setApprovedBy(approvedBy);
        reimbursement.setApprovedAt(OffsetDateTime.now());

        ReimbursementRequest savedReimbursement = reimbursementRepository.save(reimbursement);

        // Post to GL: Debit Expense, Credit Cash/Bank
        glPostingService.postReimbursementExpense(
            savedReimbursement.getId(),
            "RMB-" + savedReimbursement.getId().toString().substring(0, 8).toUpperCase(),
            savedReimbursement.getAmount(),
            savedReimbursement.getCurrency(),
            savedReimbursement.getCategory(),
            "Reimbursement approved: " + savedReimbursement.getDescription()
        );

        return toDto(savedReimbursement);
    }

    private ReimbursementRequestDto toDto(ReimbursementRequest reimbursement) {
        ReimbursementRequestDto dto = new ReimbursementRequestDto();
        dto.setId(reimbursement.getId());
        dto.setRequestedBy(reimbursement.getRequestedBy());
        dto.setRequesterEmail(reimbursement.getRequesterEmail());
        dto.setAmount(reimbursement.getAmount());
        dto.setCurrency(reimbursement.getCurrency());
        dto.setCategory(reimbursement.getCategory());
        dto.setRequestDate(reimbursement.getRequestDate());
        dto.setDescription(reimbursement.getDescription());
        dto.setStatus(reimbursement.getStatus());
        dto.setApprovedBy(reimbursement.getApprovedBy());
        dto.setApprovedAt(reimbursement.getApprovedAt());
        dto.setNotes(reimbursement.getNotes());
        if (reimbursement.getCreatedAt() != null) {
            dto.setCreatedAt(reimbursement.getCreatedAt().toInstant());
        }
        if (reimbursement.getUpdatedAt() != null) {
            dto.setUpdatedAt(reimbursement.getUpdatedAt().toInstant());
        }
        return dto;
    }
}
