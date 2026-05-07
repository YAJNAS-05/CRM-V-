package com.everx.hr.performance;

import com.everx.hr.performance.dto.CreatePerformanceReviewRequest;
import com.everx.hr.performance.dto.PerformanceReviewDto;
import com.everx.hr.performance.dto.UpdatePerformanceReviewRequest;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PerformanceReviewService {

    private final PerformanceReviewRepository repository;

    @Transactional(readOnly = true)
    public Page<PerformanceReviewDto> getAll(UUID employeeId, UUID reviewerId, Pageable pageable) {
        if (employeeId != null) {
            return repository.findByEmployeeIdAndIsDeletedFalse(employeeId, pageable)
                    .map(PerformanceReviewDto::fromEntity);
        }
        if (reviewerId != null) {
            return repository.findByReviewerIdAndIsDeletedFalse(reviewerId, pageable)
                    .map(PerformanceReviewDto::fromEntity);
        }
        return repository.findByIsDeletedFalse(pageable).map(PerformanceReviewDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public PerformanceReviewDto getById(UUID id) {
        return repository.findByIdAndIsDeletedFalse(id)
                .map(PerformanceReviewDto::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Performance review not found: " + id));
    }

    public PerformanceReviewDto create(CreatePerformanceReviewRequest request) {
        PerformanceReview review = new PerformanceReview();
        review.setEmployeeId(request.getEmployeeId());
        review.setReviewerId(request.getReviewerId());
        review.setReviewPeriod(request.getReviewPeriod() != null ? request.getReviewPeriod() : "");
        review.setStatus(request.getStatus() != null ? request.getStatus() : "DRAFT");
        review.setOverallRating(request.getOverallRating());
        review.setGoalsRating(request.getGoalsRating());
        review.setSkillsRating(request.getSkillsRating());
        review.setComments(request.getComments());
        review.setReviewerNotes(request.getReviewerNotes());
        review.setReviewDate(request.getReviewDate());
        return PerformanceReviewDto.fromEntity(repository.save(review));
    }

    public PerformanceReviewDto update(UUID id, UpdatePerformanceReviewRequest request) {
        PerformanceReview review = repository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Performance review not found: " + id));
        if (request.getReviewerId() != null) review.setReviewerId(request.getReviewerId());
        if (request.getReviewPeriod() != null) review.setReviewPeriod(request.getReviewPeriod());
        if (request.getStatus() != null) review.setStatus(request.getStatus());
        if (request.getOverallRating() != null) review.setOverallRating(request.getOverallRating());
        if (request.getGoalsRating() != null) review.setGoalsRating(request.getGoalsRating());
        if (request.getSkillsRating() != null) review.setSkillsRating(request.getSkillsRating());
        if (request.getComments() != null) review.setComments(request.getComments());
        if (request.getReviewerNotes() != null) review.setReviewerNotes(request.getReviewerNotes());
        if (request.getReviewDate() != null) review.setReviewDate(request.getReviewDate());
        return PerformanceReviewDto.fromEntity(repository.save(review));
    }

    public void delete(UUID id) {
        PerformanceReview review = repository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Performance review not found: " + id));
        review.softDelete();
        repository.save(review);
    }
}
