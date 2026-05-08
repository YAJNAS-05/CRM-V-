package com.everx.finance.journal;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class GlPostingService {

    public void postJournalEntry(UUID tenantId, String accountCode, BigDecimal amount, String description) {
        log.info("Posting journal entry for tenant: {} to account: {} amount: {}", tenantId, accountCode, amount);
        // Mock implementation
    }

    public void postReimbursementEntry(UUID reimbursementId, UUID employeeId, BigDecimal amount) {
        log.info("Posting reimbursement entry for reimbursement: {} employee: {} amount: {}", reimbursementId, employeeId, amount);
        // Mock implementation
    }

    public void reverseJournalEntry(UUID entryId, String reason) {
        log.info("Reversing journal entry: {} reason: {}", entryId, reason);
        // Mock implementation
    }
}
