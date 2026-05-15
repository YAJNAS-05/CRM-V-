package com.everx.crm.deal;

import com.everx.crm.deal.dto.CreateDealRequest;
import com.everx.crm.deal.dto.DealDto;
import com.everx.crm.deal.dto.UpdateDealRequest;
import com.everx.shared.util.SecurityUserContext;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.UUID;

@Service
@Transactional
@Slf4j
public class DealService {

    @Autowired
    private DealRepository dealRepository;

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
                .probability(request.getProbability())
                .expectedCloseDate(request.getExpectedCloseDate())
                .leadSource(request.getLeadSource())
                .accountId(request.getAccountId())
                .primaryContactId(request.getPrimaryContactId())
                .description(request.getDescription())
                .nextStep(request.getNextStep())
                .campaignSource(request.getCampaignSource())
                .ownerId(ownerId)
                .build();
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
        if (request.getStage() != null) deal.setStage(request.getStage());
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

        Deal updatedDeal = dealRepository.save(deal);
        return DealDto.fromEntity(Objects.requireNonNull(updatedDeal, "Updated deal is null"));
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
}
