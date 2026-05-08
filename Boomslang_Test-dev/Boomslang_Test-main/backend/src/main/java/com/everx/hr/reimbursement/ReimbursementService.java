package com.everx.hr.reimbursement;

import com.everx.finance.journal.GlPostingService;
import com.everx.finance.journal.GlJournalEntryRepository;
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
    private final GlJournalEntryRepository glJournalEntryRepository;

    @Transactional
    public ReimbursementRequestDto createReimbursement(CreateReimbursementRequest request) {
        if (request.getAmount() == null || request.getAmount().signum() <= 0) {
            throw new ValidationException("Reimbursement amount must be greater than zero");
        }

        ReimbursementRequest reimbursement = new ReimbursementRequest();
        reimbursement.setRequestedBy(request.getRequestedBy());
        reimbursement.setRequesterEmail(request.getRequesterEmail());
        reimbursement.setAmount(request.getAmount());
        String currency = request.getCurrency();
        reimbursement.setCurrency(currency == null || currency.trim().isEmpty() ? "AUD" : currency.trim());
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

        if (request.getStatus() != null && request.getStatus() != reimbursement.getStatus()) {
            if (request.getStatus() == ReimbursementStatus.APPROVED) {
                throw new ValidationException("Use the approval action to approve reimbursements.");
            }
            if (request.getStatus() == ReimbursementStatus.PAID) {
                throw new ValidationException("Use the payment action to mark reimbursements as paid.");
            }
            if (request.getStatus() == ReimbursementStatus.REJECTED
                    && reimbursement.getStatus() != ReimbursementStatus.SUBMITTED) {
                throw new ValidationException("Only submitted reimbursements can be rejected.");
            }
            if (request.getStatus() == ReimbursementStatus.SUBMITTED) {
                throw new ValidationException("Cannot revert reimbursement status to SUBMITTED.");
            }
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
        if (reimbursement.getStatus() != ReimbursementStatus.SUBMITTED) {
            throw new ValidationException("Only submitted reimbursements can be approved.");
        }
        reimbursement.setStatus(ReimbursementStatus.APPROVED);
        reimbursement.setApprovedBy(approvedBy);
        reimbursement.setApprovedAt(OffsetDateTime.now());

        ReimbursementRequest savedReimbursement = reimbursementRepository.save(reimbursement);

        return toDto(savedReimbursement);
    }

    @Transactional
    public ReimbursementRequestDto payReimbursement(UUID id, UUID paidBy, String reference) {
        ReimbursementRequest reimbursement = reimbursementRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Reimbursement not found with id: " + id));

        if (paidBy == null) {
            throw new ValidationException("Paid-by user is required to mark reimbursement as paid.");
        }

        if (reimbursement.getStatus() != ReimbursementStatus.APPROVED) {
            throw new ValidationException("Only approved reimbursements can be marked as paid.");
        }

        String currency = reimbursement.getCurrency();
        if (currency == null || currency.trim().isEmpty()) {
            throw new ValidationException("Currency is required to post reimbursement payment.");
        }

        String paymentReference = reference != null && !reference.trim().isEmpty()
                ? reference.trim()
                : "RMB-PAY-" + reimbursement.getId().toString().substring(0, 8).toUpperCase();

        reimbursement.setStatus(ReimbursementStatus.PAID);
        reimbursement.setPaidBy(paidBy);
        reimbursement.setPaidAt(OffsetDateTime.now());
        reimbursement.setPaymentReference(paymentReference);

        ReimbursementRequest savedReimbursement = reimbursementRepository.save(reimbursement);

        if (glJournalEntryRepository.findLatestBySourceAndRef("REIMBURSEMENT", savedReimbursement.getId().toString()).isEmpty()) {
            // Post to GL: Debit Expense, Credit Cash/Bank
            glPostingService.postReimbursementExpense(
                savedReimbursement.getId(),
                paymentReference,
                savedReimbursement.getAmount(),
                savedReimbursement.getCurrency(),
                savedReimbursement.getCategory(),
                "Reimbursement paid: " + savedReimbursement.getDescription()
            );
        }

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
        dto.setPaidBy(reimbursement.getPaidBy());
        dto.setPaidAt(reimbursement.getPaidAt());
        dto.setPaymentReference(reimbursement.getPaymentReference());
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
