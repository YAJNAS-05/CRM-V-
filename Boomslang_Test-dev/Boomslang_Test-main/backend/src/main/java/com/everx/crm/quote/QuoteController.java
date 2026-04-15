package com.everx.crm.quote;

import com.everx.crm.quote.dto.CreateQuoteRequest;
import com.everx.crm.quote.dto.QuoteDto;
import com.everx.crm.quote.dto.UpdateQuoteRequest;
import com.everx.shared.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/crm/quotes")
@Validated
@Slf4j
public class QuoteController {

    @Autowired
    private QuoteService quoteService;

    @Autowired
    private PdfService pdfService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER','SALES_REP')")
    public ResponseEntity<ApiResponse<Page<QuoteDto>>> getAllQuotes(
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/crm/quotes");
        Page<QuoteDto> quotes = quoteService.getAllQuotes(pageable);
        return ResponseEntity.ok(ApiResponse.ok(quotes, "Quotes retrieved successfully"));
    }

    @GetMapping("/{quoteId}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER','SALES_REP')")
    public ResponseEntity<ApiResponse<QuoteDto>> getQuoteById(@PathVariable UUID quoteId) {
        log.info("GET /api/v1/crm/quotes/{}", quoteId);
        QuoteDto quote = quoteService.getQuoteById(quoteId);
        return ResponseEntity.ok(ApiResponse.ok(quote, "Quote retrieved successfully"));
    }

    @GetMapping("/deal/{dealId}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER','SALES_REP')")
    public ResponseEntity<ApiResponse<Page<QuoteDto>>> getQuotesByDeal(
            @PathVariable UUID dealId,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/crm/quotes/deal/{}", dealId);
        Page<QuoteDto> quotes = quoteService.getQuotesByDeal(dealId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(quotes, "Quotes retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER','SALES_REP')")
    public ResponseEntity<ApiResponse<QuoteDto>> createQuote(@Valid @RequestBody CreateQuoteRequest request) {
        log.info("POST /api/v1/crm/quotes");
        QuoteDto quote = quoteService.createQuote(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(quote, "Quote created successfully"));
    }

    @PutMapping("/{quoteId}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER','SALES_REP')")
    public ResponseEntity<ApiResponse<QuoteDto>> updateQuote(
            @PathVariable UUID quoteId,
            @Valid @RequestBody UpdateQuoteRequest request) {
        log.info("PUT /api/v1/crm/quotes/{}", quoteId);
        QuoteDto quote = quoteService.updateQuote(quoteId, request);
        return ResponseEntity.ok(ApiResponse.ok(quote, "Quote updated successfully"));
    }

    @DeleteMapping("/{quoteId}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteQuote(@PathVariable UUID quoteId) {
        log.info("DELETE /api/v1/crm/quotes/{}", quoteId);
        quoteService.deleteQuote(quoteId);
        return ResponseEntity.ok(ApiResponse.okMessage("Quote deleted successfully"));
    }

    @GetMapping("/{quoteId}/pdf")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER','SALES_REP')")
    public ResponseEntity<byte[]> generateQuotePdf(@PathVariable UUID quoteId) {
        log.info("GET /api/v1/crm/quotes/{}/pdf", quoteId);
        QuoteDto quote = quoteService.getQuoteById(quoteId);
        byte[] pdfBytes = pdfService.generateQuotePdf(quote);
        
        return ResponseEntity.ok()
                .header("Content-Type", "text/html")
                .header("Content-Disposition", "inline; filename=quote-" + quote.getQuoteNumber() + ".html")
                .body(pdfBytes);
    }
}
