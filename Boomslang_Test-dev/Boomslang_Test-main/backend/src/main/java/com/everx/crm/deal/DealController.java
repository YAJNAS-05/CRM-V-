package com.everx.crm.deal;

import com.everx.crm.deal.dto.CreateDealRequest;
import com.everx.crm.deal.dto.DealDto;
import com.everx.crm.deal.dto.UpdateDealRequest;
import com.everx.crm.deal.dto.UpdateDealStageRequest;
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
    @PreAuthorize("hasAuthority('CRM_VIEW')")
    public ResponseEntity<ApiResponse<Page<DealDto>>> getAllDeals(
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/crm/deals");
        Page<DealDto> deals = dealService.getAllDeals(Objects.requireNonNull(pageable));
        return ResponseEntity.ok(ApiResponse.ok(deals, "Deals retrieved successfully"));
    }

    @GetMapping("/{dealId:[0-9a-fA-F-]{36}}")
    @PreAuthorize("hasAuthority('CRM_VIEW')")
    public ResponseEntity<ApiResponse<DealDto>> getDealById(@PathVariable @NonNull UUID dealId) {
        log.info("GET /api/v1/crm/deals/{}", dealId);
        DealDto deal = dealService.getDealById(dealId);
        return ResponseEntity.ok(ApiResponse.ok(deal, "Deal retrieved successfully"));
    }

    @GetMapping("/account/{accountId}")
    @PreAuthorize("hasAuthority('CRM_VIEW')")
    public ResponseEntity<ApiResponse<Page<DealDto>>> getDealsByAccount(
            @PathVariable @NonNull UUID accountId,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/crm/deals/account/{}", accountId);
        Page<DealDto> deals = dealService.getDealsByAccount(accountId, Objects.requireNonNull(pageable));
        return ResponseEntity.ok(ApiResponse.ok(deals, "Deals retrieved successfully"));
    }

    @GetMapping("/stage/{stage}")
    @PreAuthorize("hasAuthority('CRM_VIEW')")
    public ResponseEntity<ApiResponse<Page<DealDto>>> getDealsByStage(
            @PathVariable String stage,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/crm/deals/stage/{}", stage);
        Page<DealDto> deals = dealService.getDealsByStage(stage, Objects.requireNonNull(pageable));
        return ResponseEntity.ok(ApiResponse.ok(deals, "Deals retrieved successfully"));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('CRM_VIEW')")
    public ResponseEntity<ApiResponse<Page<DealDto>>> searchDeals(
            @RequestParam("q") String query,
            @RequestParam(value = "stage", required = false) String stage,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/crm/deals/search?q={}&stage={}", query, stage);
        Page<DealDto> deals = dealService.searchDeals(query, stage, Objects.requireNonNull(pageable));
        return ResponseEntity.ok(ApiResponse.ok(deals, "Deals search results"));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CRM_CREATE')")
    public ResponseEntity<ApiResponse<DealDto>> createDeal(@Valid @RequestBody CreateDealRequest request) {
        log.info("POST /api/v1/crm/deals");
        DealDto deal = dealService.createDeal(Objects.requireNonNull(request));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(deal, "Deal created successfully"));
    }

    @PutMapping("/{dealId:[0-9a-fA-F-]{36}}")
    @PreAuthorize("hasAuthority('CRM_EDIT')")
    public ResponseEntity<ApiResponse<DealDto>> updateDeal(
            @PathVariable @NonNull UUID dealId,
            @Valid @RequestBody @NonNull UpdateDealRequest request) {
        log.info("PUT /api/v1/crm/deals/{}", dealId);
        DealDto deal = dealService.updateDeal(dealId, request);
        return ResponseEntity.ok(ApiResponse.ok(deal, "Deal updated successfully"));
    }

    @PatchMapping("/{dealId:[0-9a-fA-F-]{36}}/stage")
    @PreAuthorize("hasAuthority('CRM_EDIT')")
    public ResponseEntity<ApiResponse<DealDto>> updateDealStage(
            @PathVariable @NonNull UUID dealId,
            @Valid @RequestBody UpdateDealStageRequest request) {
        log.info("PATCH /api/v1/crm/deals/{}/stage", dealId);
        DealDto deal = dealService.updateStage(dealId, request.getStage());
        return ResponseEntity.ok(ApiResponse.ok(deal, "Deal stage updated"));
    }

    @GetMapping("/{dealId:[0-9a-fA-F-]{36}}/weighted-revenue")
    @PreAuthorize("hasAuthority('CRM_VIEW')")
    public ResponseEntity<ApiResponse<java.math.BigDecimal>> getWeightedRevenue(
            @PathVariable @NonNull UUID dealId) {
        log.info("GET /api/v1/crm/deals/{}/weighted-revenue", dealId);
        return ResponseEntity.ok(ApiResponse.ok(dealService.calculateWeightedRevenue(dealId)));
    }

    @DeleteMapping("/{dealId:[0-9a-fA-F-]{36}}")
    @PreAuthorize("hasAuthority('CRM_DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteDeal(@PathVariable @NonNull UUID dealId) {
        log.info("DELETE /api/v1/crm/deals/{}", dealId);
        dealService.deleteDeal(dealId);
        return ResponseEntity.ok(ApiResponse.okMessage("Deal deleted successfully"));
    }
}
