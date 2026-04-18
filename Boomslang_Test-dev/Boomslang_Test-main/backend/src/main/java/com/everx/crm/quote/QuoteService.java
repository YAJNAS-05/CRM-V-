package com.everx.crm.quote;

import com.everx.crm.quote.dto.CreateQuoteLineItemRequest;
import com.everx.crm.quote.dto.CreateQuoteRequest;
import com.everx.crm.quote.dto.QuoteDto;
import com.everx.crm.quote.dto.UpdateQuoteRequest;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class QuoteService {

    @Autowired
    private QuoteRepository quoteRepository;

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
        return QuoteDto.fromEntity(quoteRepository.save(quote));
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

        return QuoteDto.fromEntity(quoteRepository.save(quote));
    }

    public void deleteQuote(UUID quoteId) {
        log.info("Soft deleting quote {}", quoteId);
        Quote quote = quoteRepository.findByIdActive(quoteId)
                .orElseThrow(() -> new EntityNotFoundException("Quote not found with id: " + quoteId));
        quote.softDelete();
        quoteRepository.save(quote);
    }

    public Page<QuoteDto> getQuotesByDeal(UUID dealId, Pageable pageable) {
        log.info("Fetching quotes for deal {}", dealId);
        return quoteRepository.findByDealId(dealId, pageable).map(QuoteDto::fromEntity);
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
}
