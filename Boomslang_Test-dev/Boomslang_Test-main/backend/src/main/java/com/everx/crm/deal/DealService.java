package com.everx.crm.deal;

import com.everx.crm.activity.ActivityService;
import com.everx.crm.activity.dto.CreateActivityRequest;
import com.everx.crm.deal.dto.CreateDealRequest;
import com.everx.crm.deal.dto.DealDto;
import com.everx.crm.deal.dto.UpdateDealRequest;
import com.everx.crm.quote.QuoteRepository;
import com.everx.shared.util.SecurityUserContext;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
@Transactional
@Slf4j
public class DealService {

    @Autowired
    private DealRepository dealRepository;

    @Autowired
    private QuoteRepository quoteRepository;

    @Autowired
    private ActivityService activityService;

    public Page<DealDto> getAllDeals(@NonNull Pageable pageable) {
        log.info("Fetching deals page {} size {}", pageable.getPageNumber(), pageable.getPageSize());
        return dealRepository.findAllActive(pageable).map(DealDto::fromEntity);
    }

    public Page<DealDto> searchDeals(String query, DealStage stage, Pageable pageable) {
        String normalizedQuery = query != null ? query.trim() : null;
        log.info("Searching deals with query {} stage {}", normalizedQuery, stage);
        return dealRepository.search(normalizedQuery, stage, pageable).map(DealDto::fromEntity);
    }

    /**
     * Get deal by ID
     */
    public DealDto getDealById(@NonNull UUID dealId) {
        log.info("Fetching deal {}", dealId);
        Deal deal = dealRepository.findByIdActive(dealId)
                .orElseThrow(() -> new EntityNotFoundException("Deal not found with id: " + dealId));
        return DealDto.fromEntity(deal);
    }

    public DealDto createDeal(@NonNull CreateDealRequest request) {
        log.info("Creating deal {}", request.getName());
        UUID ownerId = request.getOwnerId() != null ? request.getOwnerId() : SecurityUserContext.getCurrentUserIdOrNull();

        Deal deal = Deal.builder()
                .name(request.getName())
                .stage(request.getStage() != null ? request.getStage() : DealStage.PROSPECTING)
                .amount(request.getAmount())
            .probability(request.getProbability() != null ? request.getProbability() : 50)
                .expectedCloseDate(request.getExpectedCloseDate())
                .leadSource(request.getLeadSource())
                .accountId(request.getAccountId())
                .primaryContactId(request.getPrimaryContactId())
                .description(request.getDescription())
                .nextStep(request.getNextStep())
                .campaignSource(request.getCampaignSource())
                .ownerId(ownerId)
                .build();
        updateWeightedRevenue(deal);
        Deal savedDeal = dealRepository.save(deal);
        return DealDto.fromEntity(Objects.requireNonNull(savedDeal, "Saved deal is null"));
    }

    /**
     * Update deal
     */
    public DealDto updateDeal(@NonNull UUID dealId, @NonNull UpdateDealRequest request) {
        log.info("Updating deal {}", dealId);
        Deal deal = dealRepository.findByIdActive(dealId)
                .orElseThrow(() -> new EntityNotFoundException("Deal not found with id: " + dealId));

        if (request.getName() != null) deal.setName(request.getName());
        if (request.getStage() != null && request.getStage() != deal.getStage()) {
            validateStageChange(deal, request.getStage());
            deal.setStage(request.getStage());
            deal.setDaysInStage(0);
        }
        if (request.getAmount() != null) deal.setAmount(request.getAmount());
        if (request.getProbability() != null) deal.setProbability(request.getProbability());
        if (request.getExpectedCloseDate() != null) deal.setExpectedCloseDate(request.getExpectedCloseDate());
        if (request.getActualCloseDate() != null) deal.setActualCloseDate(request.getActualCloseDate());
        if (request.getLeadSource() != null) deal.setLeadSource(request.getLeadSource());
        if (request.getAccountId() != null) deal.setAccountId(request.getAccountId());
        if (request.getPrimaryContactId() != null) deal.setPrimaryContactId(request.getPrimaryContactId());
        if (request.getDescription() != null) deal.setDescription(request.getDescription());
        if (request.getLossReason() != null) deal.setLossReason(request.getLossReason());
        if (request.getNextStep() != null) deal.setNextStep(request.getNextStep());
        if (request.getCampaignSource() != null) deal.setCampaignSource(request.getCampaignSource());
        if (request.getOwnerId() != null) deal.setOwnerId(request.getOwnerId());

        updateWeightedRevenue(deal);
        refreshPipelineMetrics(deal);

        Deal updatedDeal = dealRepository.save(deal);
        return DealDto.fromEntity(Objects.requireNonNull(updatedDeal, "Updated deal is null"));
    }

    public DealDto updateStage(@NonNull UUID dealId, @NonNull DealStage newStage) {
        Deal deal = dealRepository.findByIdActive(dealId)
                .orElseThrow(() -> new EntityNotFoundException("Deal not found with id: " + dealId));

        validateStageChange(deal, newStage);

        DealStage oldStage = deal.getStage();
        deal.setStage(newStage);
        deal.setDaysInStage(0);
        refreshPipelineMetrics(deal);

        Deal updatedDeal = dealRepository.save(deal);
        logAutoActivity(deal.getId(), "STAGE_CHANGED",
                "Deal stage updated", oldStage + " -> " + newStage);
        return DealDto.fromEntity(updatedDeal);
    }

    public BigDecimal calculateWeightedRevenue(@NonNull UUID dealId) {
        Deal deal = dealRepository.findByIdActive(dealId)
                .orElseThrow(() -> new EntityNotFoundException("Deal not found with id: " + dealId));
        updateWeightedRevenue(deal);
        Deal savedDeal = dealRepository.save(deal);
        return savedDeal.getExpectedRevenueWeighted();
    }

    public void deleteDeal(@NonNull UUID dealId) {
        log.info("Soft deleting deal {}", dealId);
        Deal deal = dealRepository.findByIdActive(dealId)
                .orElseThrow(() -> new EntityNotFoundException("Deal not found with id: " + dealId));
        deal.softDelete();
        dealRepository.save(deal);
    }

    public Page<DealDto> getDealsByAccount(@NonNull UUID accountId, @NonNull Pageable pageable) {
        log.info("Fetching deals for account {}", accountId);
        return dealRepository.findByAccountId(accountId, pageable).map(DealDto::fromEntity);
    }

    public Page<DealDto> getDealsByStage(@NonNull DealStage stage, @NonNull Pageable pageable) {
        log.info("Fetching deals by stage {}", stage);
        return dealRepository.findByStage(stage, pageable).map(DealDto::fromEntity);
    }

    private void validateStageChange(Deal deal, DealStage newStage) {
        DealStage currentStage = deal.getStage();
        Map<DealStage, List<DealStage>> allowedTransitions = Map.of(
                DealStage.PROSPECTING, List.of(DealStage.QUALIFICATION, DealStage.CLOSED_LOST),
                DealStage.QUALIFICATION, List.of(DealStage.PROSPECTING, DealStage.PROPOSAL, DealStage.CLOSED_LOST),
                DealStage.PROPOSAL, List.of(DealStage.NEGOTIATION, DealStage.QUALIFICATION, DealStage.CLOSED_LOST),
                DealStage.NEGOTIATION, List.of(DealStage.CLOSED_WON, DealStage.PROPOSAL, DealStage.CLOSED_LOST),
                DealStage.CLOSED_WON, List.of(),
                DealStage.CLOSED_LOST, List.of(DealStage.PROSPECTING)
        );

        List<DealStage> allowed = allowedTransitions.getOrDefault(currentStage, List.of());
        if (!allowed.contains(newStage)) {
            throw new ValidationException("Cannot move from " + currentStage + " to " + newStage);
        }

        if (newStage == DealStage.PROPOSAL && quoteRepository.findAllByDealId(deal.getId()).isEmpty()) {
            throw new ValidationException("Cannot move to PROPOSAL without at least one quote");
        }
    }

    private void updateWeightedRevenue(Deal deal) {
        BigDecimal amount = deal.getAmount() != null ? deal.getAmount() : BigDecimal.ZERO;
        Integer probability = deal.getProbability() != null ? deal.getProbability() : 0;
        BigDecimal weighted = amount.multiply(BigDecimal.valueOf(probability))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        deal.setExpectedRevenueWeighted(weighted);
    }

    private void refreshPipelineMetrics(Deal deal) {
        if (deal.getCreatedAt() == null) {
            return;
        }
        long daysInPipeline = ChronoUnit.DAYS.between(deal.getCreatedAt().toLocalDate(), LocalDate.now());
        deal.setDaysInPipeline(Math.max((int) daysInPipeline, 0));
        if (deal.getDaysInStage() == null) {
            deal.setDaysInStage(0);
        }
    }

    private void logAutoActivity(UUID dealId, String type, String subject, String description) {
        CreateActivityRequest request = new CreateActivityRequest();
        request.setType(type);
        request.setSubject(subject);
        request.setDescription(description);
        request.setStatus("COMPLETED");
        request.setDealId(dealId);
        request.setAssignedTo(SecurityUserContext.getCurrentUserIdOrNull());
        activityService.createActivity(request);
    }
}
