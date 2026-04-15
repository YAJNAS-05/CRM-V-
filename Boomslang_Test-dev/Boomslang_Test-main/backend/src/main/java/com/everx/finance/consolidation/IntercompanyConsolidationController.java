package com.everx.finance.consolidation;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * REST Controller for intercompany transaction elimination.
 * 
 * Manages consolidation elimination for intercompany transactions.
 * Only FINANCE or ADMIN role can manage consolidation.
 */
@RestController
@RequestMapping("/api/v1/finance/consolidation")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('FINANCE', 'ADMIN')")
public class IntercompanyConsolidationController {

    private final IntercompanyTransactionRepository icRepository;
    private final IntercompanyEliminationService eliminationService;

    /**
     * Get all pending intercompany transactions for a consolidation period.
     * 
     * Example:
     * GET /api/v1/finance/consolidation/pending?period=2026-04
     * 
     * @param period The consolidation period (yyyy-MM format)
     * @return List of pending transactions
     */
    @GetMapping("/pending")
    public ResponseEntity<List<IntercompanyTransactionResponse>> getPendingTransactions(
            @RequestParam String period) {
        return ResponseEntity.ok(
            icRepository.findPendingForPeriod(period).stream()
                .map(this::toResponse)
                .toList()
        );
    }

    /**
     * Get all intercompany transactions between two entities for a period.
     * 
     * Example:
     * GET /api/v1/finance/consolidation/between?from=AU01&to=US01&period=2026-04
     * 
     * @param fromEntity Source entity
     * @param toEntity Target entity
     * @param period Consolidation period
     * @return List of transactions
     */
    @GetMapping("/between")
    public ResponseEntity<List<IntercompanyTransactionResponse>> getTransactionsBetweenEntities(
            @RequestParam String fromEntity,
            @RequestParam String toEntity,
            @RequestParam String period) {
        return ResponseEntity.ok(
            icRepository.findByEntityPair(fromEntity, toEntity, period).stream()
                .map(this::toResponse)
                .toList()
        );
    }

    /**
     * Record a new intercompany transaction.
     * 
     * Request body example:
     * {
     *   "fromEntity": "AU01",
     *   "toEntity": "US01",
     *   "sourceDocumentType": "INVOICE",
     *   "sourceDocumentId": "INV-2026-0001",
     *   "transactionAmount": 50000.00,
     *   "currency": "USD",
     *   "transactionDate": "2026-04-14",
     *   "consolidationPeriod": "2026-04"
     * }
     * 
     * @param request The transaction to record
     * @return Created transaction with HTTP 201 Created
     */
    @PostMapping
    public ResponseEntity<IntercompanyTransactionResponse> recordTransaction(
            @RequestBody RecordIntercompanyTransactionRequest request) {
        IntercompanyTransaction ic = IntercompanyTransaction.builder()
                .fromEntity(request.getFromEntity())
                .toEntity(request.getToEntity())
                .sourceDocumentType(request.getSourceDocumentType())
                .sourceDocumentId(request.getSourceDocumentId())
                .transactionAmount(request.getTransactionAmount())
                .currency(request.getCurrency())
                .transactionDate(request.getTransactionDate())
                .consolidationPeriod(request.getConsolidationPeriod())
                .eliminationStatus(IntercompanyTransaction.EliminationStatus.PENDING)
                .build();

        IntercompanyTransaction saved = icRepository.save(ic);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    /**
     * Mark an intercompany transaction as eliminated.
     * 
     * @param id Transaction ID
     * @param notes Optional notes about the elimination
     * @return Updated transaction
     */
    @PostMapping("/{id}/eliminate")
    public ResponseEntity<IntercompanyTransactionResponse> eliminateTransaction(
            @PathVariable UUID id,
            @RequestBody(required = false) String notes) {
        IntercompanyTransaction ic = icRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + id));

        ic.setEliminationStatus(IntercompanyTransaction.EliminationStatus.ELIMINATED);
        ic.setEliminatedBy(getCurrentUser());
        ic.setEliminatedAt(LocalDateTime.now());
        ic.setEliminationNotes(notes);

        IntercompanyTransaction saved = icRepository.save(ic);
        return ResponseEntity.ok(toResponse(saved));
    }

    /**
     * Reverse an intercompany transaction elimination.
     * 
     * @param id Transaction ID
     * @param notes Optional notes about the reversal
     * @return Updated transaction
     */
    @PostMapping("/{id}/reverse-elimination")
    public ResponseEntity<IntercompanyTransactionResponse> reverseElimination(
            @PathVariable UUID id,
            @RequestBody(required = false) String notes) {
        IntercompanyTransaction ic = icRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + id));

        ic.setEliminationStatus(IntercompanyTransaction.EliminationStatus.REVERSED);
        ic.setEliminatedBy(getCurrentUser());
        ic.setEliminatedAt(LocalDateTime.now());
        ic.setEliminationNotes(notes);

        IntercompanyTransaction saved = icRepository.save(ic);
        return ResponseEntity.ok(toResponse(saved));
    }

    /**
     * Execute consolidation elimination for a period.
     * Marks all pending transactions as eliminated.
     * 
     * @param period The consolidation period (yyyy-MM format)
     * @return HTTP 204 No Content
     */
    @PostMapping("/execute/{period}")
    public ResponseEntity<Void> executeConsolidation(@PathVariable String period) {
        eliminationService.eliminateIntercompanyTransactions(
            Integer.parseInt(period.substring(0, 4)),
            Integer.parseInt(period.substring(5, 7)),
            getCurrentUser()
        );
        return ResponseEntity.noContent().build();
    }

    private IntercompanyTransactionResponse toResponse(IntercompanyTransaction ic) {
        return IntercompanyTransactionResponse.builder()
                .id(ic.getId())
                .fromEntity(ic.getFromEntity())
                .toEntity(ic.getToEntity())
                .sourceDocumentType(ic.getSourceDocumentType())
                .sourceDocumentId(ic.getSourceDocumentId())
                .transactionAmount(ic.getTransactionAmount())
                .currency(ic.getCurrency())
                .transactionDate(ic.getTransactionDate())
                .eliminationStatus(ic.getEliminationStatus().name())
                .eliminatedBy(ic.getEliminatedBy())
                .eliminatedAt(ic.getEliminatedAt())
                .consolidationPeriod(ic.getConsolidationPeriod())
                .eliminationNotes(ic.getEliminationNotes())
                .build();
    }

    private String getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "SYSTEM";
    }
}
