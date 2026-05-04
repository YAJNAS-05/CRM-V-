package com.everx.hr.offer;

import com.everx.hr.offer.dto.CreateOfferLetterRequest;
import com.everx.hr.offer.dto.OfferLetterDto;
import com.everx.hr.offer.dto.UpdateOfferLetterRequest;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr/offer-letters")
@RequiredArgsConstructor
public class OfferLetterController {

    private final OfferLetterService offerLetterService;

    @PostMapping
    @PreAuthorize("hasAuthority('HR_OFFER_CREATE')")
    public ResponseEntity<ApiResponse<OfferLetterDto>> create(@Valid @RequestBody CreateOfferLetterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(offerLetterService.create(request), "Offer letter created successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('HR_OFFER_VIEW')")
    public ResponseEntity<ApiResponse<OfferLetterDto>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(offerLetterService.getById(id)));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('HR_OFFER_VIEW')")
    public ResponseEntity<ApiResponse<Page<OfferLetterDto>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) OfferLetterStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(offerLetterService.getAll(pageable, search, status)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('HR_OFFER_EDIT')")
    public ResponseEntity<ApiResponse<OfferLetterDto>> update(
            @PathVariable UUID id,
            @RequestBody UpdateOfferLetterRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(offerLetterService.update(id, request), "Offer letter updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('HR_OFFER_EDIT')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        offerLetterService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Offer letter deleted successfully"));
    }
}
