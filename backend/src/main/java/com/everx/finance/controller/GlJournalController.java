package com.everx.finance.controller;

import com.everx.finance.service.GlJournalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/finance/gl")
@RequiredArgsConstructor
public class GlJournalController {
    private final GlJournalService glJournalService;

    @PostMapping("/{journalId}/post")
    public ResponseEntity<Void> postJournal(@PathVariable UUID journalId) {
        glJournalService.postJournal(journalId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{journalId}/approve")
    public ResponseEntity<Void> approveJournal(@PathVariable UUID journalId) {
        glJournalService.approveJournal(journalId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{journalId}/reject")
    public ResponseEntity<Void> rejectJournal(@PathVariable UUID journalId, @RequestParam String reason) {
        glJournalService.rejectJournal(journalId, reason);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/trial-balance")
    public ResponseEntity<List<Object[]>> getTrialBalance(@RequestParam LocalDate asOfDate) {
        return ResponseEntity.ok(glJournalService.getTrialBalance(asOfDate));
    }

    @GetMapping("/account-balances")
    public ResponseEntity<List<Object[]>> getAccountBalances(@RequestParam LocalDate asOfDate) {
        return ResponseEntity.ok(glJournalService.getAccountBalances(asOfDate));
    }
}
