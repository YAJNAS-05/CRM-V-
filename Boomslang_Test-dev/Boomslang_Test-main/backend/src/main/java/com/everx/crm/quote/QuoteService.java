package com.everx.crm.quote;

import com.everx.crm.activity.ActivityService;
import com.everx.crm.activity.dto.CreateActivityRequest;
import com.everx.crm.deal.Deal;
import com.everx.crm.deal.DealRepository;
import com.everx.crm.deal.dto.DealDto;
import com.everx.crm.quote.dto.ConvertQuoteRequest;
import com.everx.crm.quote.dto.CreateQuoteLineItemRequest;
import com.everx.crm.quote.dto.CreateQuoteRequest;
import com.everx.crm.quote.dto.QuoteDto;
import com.everx.crm.quote.dto.UpdateQuoteRequest;
import com.everx.crm.webhook.CrmWebhookPublisher;
import com.everx.erp.salesorder.SalesOrderService;
import com.everx.erp.salesorder.dto.CreateSalesOrderItemRequest;
import com.everx.erp.salesorder.dto.CreateSalesOrderRequest;
import com.everx.erp.salesorder.dto.SalesOrderDto;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import com.everx.shared.util.SecurityUserContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class QuoteService {

    private static final String ENTITY_QUOTE = "QUOTE";
    private static final String ENTITY_DEAL = "DEAL";
    private static final String EVENT_CREATED = "created";
    private static final String EVENT_UPDATED = "updated";
    private static final String EVENT_DELETED = "deleted";
    private static final String EVENT_CONVERTED = "converted";
    private static final String EVENT_STAGE_CHANGED = "stage_changed";

    @Autowired
    private QuoteRepository quoteRepository;

    @Autowired
    private DealRepository dealRepository;

    @Autowired
    private QuoteConversionRepository quoteConversionRepository;

    @Autowired
    private SalesOrderService salesOrderService;

    @Autowired
    private ActivityService activityService;

    @Autowired
    private CrmWebhookPublisher crmWebhookPublisher;

    public Page<QuoteDto> getAllQuotes(Pageable pageable) {
        log.info("Fetching quotes page {} size {}", pageable.getPageNumber(), pageable.getPageSize());
        return quoteRepository.findAllActive(pageable).map(QuoteDto::fromEntity);
    }

    public QuoteDto getQuoteById(UUID quoteId) {
        log.info("Fetching quote {}", quoteId);
        Quote quote = quoteRepository.findByIdActive(quoteId)
                .orElseThrow(() -> new EntityNotFoundException("Quote not found with id: " + quoteId));
        return QuoteDto.fromEntity(quote);
    }

    public QuoteDto createQuote(CreateQuoteRequest request) {
        log.info("Creating quote {}", request.getQuoteNumber());
        Quote quote = Quote.builder()
                .dealId(request.getDealId())
                .quoteNumber(request.getQuoteNumber())
                .version(request.getVersion())
                .status(request.getStatus())
                .issuedDate(request.getIssuedDate())
                .expiryDate(request.getExpiryDate())
                .currency(request.getCurrency())
                .subtotal(request.getSubtotal())
                .taxAmount(request.getTaxAmount())
                .totalAmount(request.getTotalAmount())
                .notes(request.getNotes())
                .terms(request.getTerms())
                .pdfUrl(request.getPdfUrl())
                .build();

        List<QuoteLineItem> lineItems = request.getLineItems().stream()
                .map(lineItemRequest -> toQuoteLineItem(lineItemRequest, quote))
                .collect(Collectors.toList());

        quote.setLineItems(lineItems);
        Quote saved = quoteRepository.save(quote);
        QuoteDto dto = QuoteDto.fromEntity(saved);
        crmWebhookPublisher.publish(ENTITY_QUOTE, EVENT_CREATED, saved.getId(), dto);
        return dto;
    }

    public QuoteDto updateQuote(UUID quoteId, UpdateQuoteRequest request) {
        log.info("Updating quote {}", quoteId);
        Quote quote = quoteRepository.findByIdActive(quoteId)
                .orElseThrow(() -> new EntityNotFoundException("Quote not found with id: " + quoteId));

        if (request.getDealId() != null) {
            quote.setDealId(request.getDealId());
        }
        if (request.getQuoteNumber() != null) {
            quote.setQuoteNumber(request.getQuoteNumber());
        }
        if (request.getVersion() != null) {
            quote.setVersion(request.getVersion());
        }
        if (request.getStatus() != null) {
            quote.setStatus(request.getStatus());
        }
        if (request.getIssuedDate() != null) {
            quote.setIssuedDate(request.getIssuedDate());
        }
        if (request.getExpiryDate() != null) {
            quote.setExpiryDate(request.getExpiryDate());
        }
        if (request.getCurrency() != null) {
            quote.setCurrency(request.getCurrency());
        }
        if (request.getSubtotal() != null) {
            quote.setSubtotal(request.getSubtotal());
        }
        if (request.getTaxAmount() != null) {
            quote.setTaxAmount(request.getTaxAmount());
        }
        if (request.getTotalAmount() != null) {
            quote.setTotalAmount(request.getTotalAmount());
        }
        if (request.getNotes() != null) {
            quote.setNotes(request.getNotes());
        }
        if (request.getTerms() != null) {
            quote.setTerms(request.getTerms());
        }
        if (request.getPdfUrl() != null) {
            quote.setPdfUrl(request.getPdfUrl());
        }
        if (request.getLineItems() != null) {
            if (quote.getLineItems() == null) {
                quote.setLineItems(new java.util.ArrayList<>());
            } else {
                quote.getLineItems().clear();
            }
            List<QuoteLineItem> lineItems = request.getLineItems().stream()
                    .map(lineItemRequest -> toQuoteLineItem(lineItemRequest, quote))
                    .collect(Collectors.toList());
            quote.setLineItems(lineItems);
        }
        Quote saved = quoteRepository.save(quote);
        QuoteDto dto = QuoteDto.fromEntity(saved);
        crmWebhookPublisher.publish(ENTITY_QUOTE, EVENT_UPDATED, saved.getId(), dto);
        return dto;
    }

    public void deleteQuote(UUID quoteId) {
        log.info("Soft deleting quote {}", quoteId);
        Quote quote = quoteRepository.findByIdActive(quoteId)
                .orElseThrow(() -> new EntityNotFoundException("Quote not found with id: " + quoteId));
        quote.softDelete();
        Quote saved = quoteRepository.save(quote);
        QuoteDto dto = QuoteDto.fromEntity(saved);
        crmWebhookPublisher.publish(ENTITY_QUOTE, EVENT_DELETED, saved.getId(), dto, Map.of("deleted", true));
    }

    public Page<QuoteDto> getQuotesByDeal(UUID dealId, Pageable pageable) {
        log.info("Fetching quotes for deal {}", dealId);
        return quoteRepository.findByDealId(dealId, pageable).map(QuoteDto::fromEntity);
    }

    public SalesOrderDto convertQuoteToSalesOrder(UUID quoteId, ConvertQuoteRequest request) {
        Quote quote = quoteRepository.findByIdActive(quoteId)
                .orElseThrow(() -> new EntityNotFoundException("Quote not found with id: " + quoteId));

        if (!"ACCEPTED".equalsIgnoreCase(quote.getStatus())) {
            throw new ValidationException("Only ACCEPTED quotes can be converted to sales orders");
        }

        quoteConversionRepository.findByQuoteIdAndIsDeletedFalse(quoteId).ifPresent(existing -> {
            throw new ValidationException("Quote is already converted");
        });

        Deal deal = dealRepository.findByIdActive(quote.getDealId())
                .orElseThrow(() -> new EntityNotFoundException("Deal not found with id: " + quote.getDealId()));

        String previousStage = deal.getStage();

        if (deal.getAccountId() == null) {
            throw new ValidationException("Deal must have an account before conversion");
        }

        List<CreateSalesOrderItemRequest> items = quote.getLineItems() == null
                ? List.of()
                : quote.getLineItems().stream()
                    .map(line -> new CreateSalesOrderItemRequest(
                            line.getEquipmentId(),
                            line.getQuantity(),
                            line.getUnitPrice(),
                            line.getLineTotal()))
                    .collect(Collectors.toList());

        CreateSalesOrderRequest soRequest = new CreateSalesOrderRequest();
        soRequest.setDealId(deal.getId());
        soRequest.setAccountId(deal.getAccountId());
        soRequest.setStatus("DRAFT");
        soRequest.setOrderDate(LocalDate.now());
        soRequest.setCurrency(quote.getCurrency());
        soRequest.setTotalAmount(quote.getTotalAmount());
        soRequest.setNotes(quote.getNotes());
        soRequest.setItems(items);

        SalesOrderDto salesOrder = salesOrderService.createSalesOrder(soRequest);

        QuoteConversion conversion = new QuoteConversion();
        conversion.setQuoteId(quoteId);
        conversion.setSalesOrderId(salesOrder.getId());
        conversion.setConvertedBy(SecurityUserContext.getCurrentUserIdOrNull());
        conversion.setConvertedAt(OffsetDateTime.now());
        conversion.setNotes(request != null ? request.getNotes() : null);
        quoteConversionRepository.save(conversion);

        quote.setStatus("CONVERTED");
        Quote savedQuote = quoteRepository.save(quote);

        deal.setStage("CLOSED_WON");
        deal.setActualCloseDate(LocalDate.now());
        Deal savedDeal = dealRepository.save(deal);

        logAutoActivity(deal.getId(), "QUOTE_CONVERTED", "Quote converted to sales order", quote.getQuoteNumber());

        QuoteDto quoteDto = QuoteDto.fromEntity(savedQuote);
        crmWebhookPublisher.publish(ENTITY_QUOTE, EVENT_CONVERTED, savedQuote.getId(), quoteDto,
            Map.of("salesOrderId", salesOrder.getId(), "dealId", deal.getId()));

        DealDto dealDto = DealDto.fromEntity(savedDeal);
        crmWebhookPublisher.publish(ENTITY_DEAL, EVENT_UPDATED, savedDeal.getId(), dealDto);
        crmWebhookPublisher.publish(ENTITY_DEAL, EVENT_STAGE_CHANGED, savedDeal.getId(), dealDto,
            Map.of("fromStage", previousStage, "toStage", savedDeal.getStage()));

        return salesOrder;
    }

    private QuoteLineItem toQuoteLineItem(CreateQuoteLineItemRequest request, Quote quote) {
        QuoteLineItem item = QuoteLineItem.builder()
                .quote(quote)
                .description(request.getDescription())
                .quantity(request.getQuantity())
                .unitPrice(request.getUnitPrice())
                .discountPct(request.getDiscountPct())
                .lineTotal(request.getTotalPrice())
                .equipmentId(request.getEquipmentId())
                .build();
        return item;
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
