package com.everx.crm.deal;

import com.everx.crm.activity.ActivityService;
import com.everx.crm.activity.dto.CreateActivityRequest;
import com.everx.crm.deal.dto.CreateDealRequest;
import com.everx.crm.deal.dto.DealDto;
import com.everx.crm.deal.dto.UpdateDealRequest;
import com.everx.crm.quote.QuoteRepository;
import com.everx.crm.webhook.CrmWebhookPublisher;
import com.everx.platform.config.service.OptionSetService;
import com.everx.platform.config.service.WorkflowEngineService;
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
import java.util.Objects;
import java.util.UUID;
import java.util.Map;

@Service
@Transactional
@Slf4j
public class DealService {

    private static final String MODULE_CRM = "CRM";
    private static final String ENTITY_DEAL = "DEAL";
    private static final String FIELD_STAGE = "stage";
    private static final String FIELD_LEAD_SOURCE = "leadSource";
    private static final String DEFAULT_STAGE = "PROSPECTING";
    private static final String EVENT_CREATED = "created";
    private static final String EVENT_UPDATED = "updated";
    private static final String EVENT_DELETED = "deleted";
    private static final String EVENT_STAGE_CHANGED = "stage_changed";

    @Autowired
    private DealRepository dealRepository;

    @Autowired
    private QuoteRepository quoteRepository;

    @Autowired
    private ActivityService activityService;

    @Autowired
    private WorkflowEngineService workflowEngineService;

    @Autowired
    private OptionSetService optionSetService;

    @Autowired
    private CrmWebhookPublisher crmWebhookPublisher;

    public Page<DealDto> getAllDeals(@NonNull Pageable pageable) {
        log.info("Fetching deals page {} size {}", pageable.getPageNumber(), pageable.getPageSize());
        return dealRepository.findAllActive(pageable).map(DealDto::fromEntity);
    }

    public Page<DealDto> searchDeals(String query, String stage, Pageable pageable) {
        String normalizedQuery = query != null ? query.trim() : null;
        String normalizedStage = normalizeStage(stage);
        log.info("Searching deals with query {} stage {}", normalizedQuery, stage);
        return dealRepository.search(normalizedQuery, normalizedStage, pageable).map(DealDto::fromEntity);
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
        String stage = resolveStage(request.getStage());

        validateOptionValue(MODULE_CRM, ENTITY_DEAL, FIELD_STAGE, stage, "Stage");
        validateOptionValue(MODULE_CRM, ENTITY_DEAL, FIELD_LEAD_SOURCE, request.getLeadSource(), "Lead source");

        Deal deal = Deal.builder()
                .name(request.getName())
            .stage(stage)
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
        DealDto dto = DealDto.fromEntity(Objects.requireNonNull(savedDeal, "Saved deal is null"));
        crmWebhookPublisher.publish(ENTITY_DEAL, EVENT_CREATED, savedDeal.getId(), dto);
        return dto;
    }

    /**
     * Update deal
     */
    public DealDto updateDeal(@NonNull UUID dealId, @NonNull UpdateDealRequest request) {
        log.info("Updating deal {}", dealId);
        Deal deal = dealRepository.findByIdActive(dealId)
                .orElseThrow(() -> new EntityNotFoundException("Deal not found with id: " + dealId));

        String previousStage = deal.getStage();

        if (request.getName() != null) deal.setName(request.getName());
        String requestedStage = normalizeStage(request.getStage());
        boolean stageChanged = requestedStage != null && !requestedStage.equalsIgnoreCase(previousStage);
        if (stageChanged) {
            validateStageChange(deal, requestedStage);
            deal.setStage(requestedStage);
            deal.setDaysInStage(0);
        }
        if (request.getAmount() != null) deal.setAmount(request.getAmount());
        if (request.getProbability() != null) deal.setProbability(request.getProbability());
        if (request.getExpectedCloseDate() != null) deal.setExpectedCloseDate(request.getExpectedCloseDate());
        if (request.getActualCloseDate() != null) deal.setActualCloseDate(request.getActualCloseDate());
        if (request.getLeadSource() != null) {
            validateOptionValue(MODULE_CRM, ENTITY_DEAL, FIELD_LEAD_SOURCE, request.getLeadSource(), "Lead source");
            deal.setLeadSource(request.getLeadSource());
        }
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
        DealDto dto = DealDto.fromEntity(Objects.requireNonNull(updatedDeal, "Updated deal is null"));
        crmWebhookPublisher.publish(ENTITY_DEAL, EVENT_UPDATED, updatedDeal.getId(), dto);
        if (stageChanged) {
            crmWebhookPublisher.publish(ENTITY_DEAL, EVENT_STAGE_CHANGED, updatedDeal.getId(), dto,
                    Map.of("fromStage", previousStage, "toStage", updatedDeal.getStage()));
        }
        return dto;
    }

    public DealDto updateStage(@NonNull UUID dealId, @NonNull String newStage) {
        Deal deal = dealRepository.findByIdActive(dealId)
                .orElseThrow(() -> new EntityNotFoundException("Deal not found with id: " + dealId));

        String requestedStage = normalizeStage(newStage);
        if (requestedStage == null) {
            throw new ValidationException("Stage is required");
        }
        validateStageChange(deal, requestedStage);

        String oldStage = deal.getStage();
        deal.setStage(requestedStage);
        deal.setDaysInStage(0);
        refreshPipelineMetrics(deal);
        Deal updatedDeal = dealRepository.save(deal);
        logAutoActivity(deal.getId(), "STAGE_CHANGED",
                "Deal stage updated", oldStage + " -> " + newStage);
        DealDto dto = DealDto.fromEntity(updatedDeal);
        crmWebhookPublisher.publish(ENTITY_DEAL, EVENT_UPDATED, updatedDeal.getId(), dto);
        crmWebhookPublisher.publish(ENTITY_DEAL, EVENT_STAGE_CHANGED, updatedDeal.getId(), dto,
            Map.of("fromStage", oldStage, "toStage", updatedDeal.getStage()));
        return dto;
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
        Deal saved = dealRepository.save(deal);
        DealDto dto = DealDto.fromEntity(saved);
        crmWebhookPublisher.publish(ENTITY_DEAL, EVENT_DELETED, saved.getId(), dto, Map.of("deleted", true));
    }

    public Page<DealDto> getDealsByAccount(@NonNull UUID accountId, @NonNull Pageable pageable) {
        log.info("Fetching deals for account {}", accountId);
        return dealRepository.findByAccountId(accountId, pageable).map(DealDto::fromEntity);
    }

    public Page<DealDto> getDealsByStage(@NonNull String stage, @NonNull Pageable pageable) {
        log.info("Fetching deals by stage {}", stage);
        return dealRepository.findByStage(stage, pageable).map(DealDto::fromEntity);
    }

    private void validateStageChange(Deal deal, String newStage) {
        if (newStage == null || newStage.isBlank()) {
            throw new ValidationException("Stage is required");
        }
        validateOptionValue(MODULE_CRM, ENTITY_DEAL, FIELD_STAGE, newStage, "Stage");
        String currentStage = deal.getStage();

        if (workflowEngineService.hasWorkflow(MODULE_CRM, ENTITY_DEAL)) {
            boolean transitionDefined = workflowEngineService
                .findTransition(MODULE_CRM, ENTITY_DEAL, currentStage, newStage)
                    .isPresent();

            if (!transitionDefined) {
                throw new ValidationException("Cannot move from " + currentStage + " to " + newStage);
            }

            workflowEngineService.enforceTransition(
                    MODULE_CRM,
                    ENTITY_DEAL,
                    deal.getId().toString(),
                    currentStage,
                    newStage);
            return;
        }

        if ("PROPOSAL".equalsIgnoreCase(newStage) && quoteRepository.findAllByDealId(deal.getId()).isEmpty()) {
            throw new ValidationException("Cannot move to PROPOSAL without at least one quote");
        }
    }

    private void validateOptionValue(String module, String entity, String field, String value, String label) {
        if (!optionSetService.isValidOptionValue(module, entity, field, value)) {
            throw new ValidationException(label + " value is not configured");
        }
    }

    private String normalizeStage(String stage) {
        if (stage == null) {
            return null;
        }
        String trimmed = stage.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String resolveStage(String stage) {
        String normalized = normalizeStage(stage);
        if (normalized != null) {
            return normalized;
        }
        return optionSetService.resolveDefaultValue(MODULE_CRM, ENTITY_DEAL, FIELD_STAGE, DEFAULT_STAGE);
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
