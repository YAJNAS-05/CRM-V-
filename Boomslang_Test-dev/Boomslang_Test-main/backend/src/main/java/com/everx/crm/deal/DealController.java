package com.everx.crm.deal;

import com.everx.crm.deal.dto.CreateDealRequest;
import com.everx.crm.deal.dto.DealDto;
import com.everx.crm.deal.dto.UpdateDealRequest;
import com.everx.shared.dto.ApiResponse;
import java.util.Objects;
import lombok.NonNull;
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

/**
 * Controller for managing CRM Deals.
 */
@RestController
@RequestMapping("/api/v1/crm/deals")
@Validated
@Slf4j
public class DealController {

    @Autowired
    private DealService dealService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER','SALES_REP')")
    public ResponseEntity<ApiResponse<Page<DealDto>>> getAllDeals(
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/crm/deals");
        Page<DealDto> deals = dealService.getAllDeals(Objects.requireNonNull(pageable));
        return ResponseEntity.ok(ApiResponse.ok(deals, "Deals retrieved successfully"));
    }

    @GetMapping("/{dealId}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER','SALES_REP')")
    public ResponseEntity<ApiResponse<DealDto>> getDealById(@PathVariable @NonNull UUID dealId) {
        log.info("GET /api/v1/crm/deals/{}", dealId);
        DealDto deal = dealService.getDealById(dealId);
        return ResponseEntity.ok(ApiResponse.ok(deal, "Deal retrieved successfully"));
    }

    @GetMapping("/account/{accountId}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER','SALES_REP')")
    public ResponseEntity<ApiResponse<Page<DealDto>>> getDealsByAccount(
            @PathVariable @NonNull UUID accountId,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/crm/deals/account/{}", accountId);
        Page<DealDto> deals = dealService.getDealsByAccount(accountId, Objects.requireNonNull(pageable));
        return ResponseEntity.ok(ApiResponse.ok(deals, "Deals retrieved successfully"));
    }

    @GetMapping("/stage/{stage}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER','SALES_REP')")
    public ResponseEntity<ApiResponse<Page<DealDto>>> getDealsByStage(
            @PathVariable DealStage stage,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/crm/deals/stage/{}", stage);
        Page<DealDto> deals = dealService.getDealsByStage(stage, Objects.requireNonNull(pageable));
        return ResponseEntity.ok(ApiResponse.ok(deals, "Deals retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER')")
    public ResponseEntity<ApiResponse<DealDto>> createDeal(@Valid @RequestBody CreateDealRequest request) {
        log.info("POST /api/v1/crm/deals");
        DealDto deal = dealService.createDeal(Objects.requireNonNull(request));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(deal, "Deal created successfully"));
    }

    @PutMapping("/{dealId}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER')")
    public ResponseEntity<ApiResponse<DealDto>> updateDeal(
            @PathVariable @NonNull UUID dealId,
            @Valid @RequestBody @NonNull UpdateDealRequest request) {
        log.info("PUT /api/v1/crm/deals/{}", dealId);
        DealDto deal = dealService.updateDeal(dealId, request);
        return ResponseEntity.ok(ApiResponse.ok(deal, "Deal updated successfully"));
    }

    @DeleteMapping("/{dealId}")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteDeal(@PathVariable @NonNull UUID dealId) {
        log.info("DELETE /api/v1/crm/deals/{}", dealId);
        dealService.deleteDeal(dealId);
        return ResponseEntity.ok(ApiResponse.okMessage("Deal deleted successfully"));
    }
}
