package com.everx.finance.service;

import com.everx.finance.dto.BankReconciliationReportDto;
import com.everx.finance.entity.*;
import com.everx.finance.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BankReconciliationService {
    private final BankReconciliationRepository reconciliationRepository;
    private final BankStatementRepository statementRepository;
    private final BankStatementLineRepository lineRepository;
    private final BankAccountRepository accountRepository;

    /**
     * Perform bank reconciliation using intelligent matching algorithm
     */
    public BankReconciliation reconcileStatement(Long statementId, String userId) {
        log.info("Starting bank reconciliation for statement: {}", statementId);
        
        BankStatement statement = statementRepository.findById(statementId)
                .orElseThrow(() -> new RuntimeException("Statement not found"));
        
        BankAccount account = statement.getBankAccount();
        
        // Create reconciliation record
        BankReconciliation reconciliation = BankReconciliation.builder()
                .bankAccount(account)
                .statement(statement)
                .reconciliationDate(LocalDate.now())
                .glBalance(account.getGlAccountBalance())
                .bankBalance(statement.getClosingBalance())
                .createdDate(LocalDate.now())
                .createdBy(userId)
                .status(BankReconciliation.ReconciliationStatus.IN_PROGRESS)
                .build();
        
        // Execute matching algorithm
        matchStatementLines(statement, account);
        
        // Calculate difference
        BigDecimal difference = statement.getClosingBalance().subtract(account.getGlAccountBalance());
        reconciliation.setDifference(difference);
        
        // Count matched/unmatched
        List<BankStatementLine> lines = lineRepository.findByStatementId(statementId);
        int matched = (int) lines.stream()
                .filter(l -> l.getMatchStatus() == BankStatementLine.MatchStatus.MATCHED)
                .count();
        
        reconciliation.setMatchedCount(matched);
        reconciliation.setUnmatchedCount(lines.size() - matched);
        
        // Determine status
        if (difference.compareTo(BigDecimal.ZERO) == 0) {
            reconciliation.setStatus(BankReconciliation.ReconciliationStatus.RECONCILED);
            reconciliation.setApprovedDate(LocalDate.now());
            reconciliation.setApprovedBy(userId);
            statement.setStatus(BankStatement.StatementStatus.RECONCILED);
        } else {
            reconciliation.setStatus(BankReconciliation.ReconciliationStatus.EXCEPTION);
            statement.setStatus(BankStatement.StatementStatus.EXCEPTION);
        }
        
        statementRepository.save(statement);
        return reconciliationRepository.save(reconciliation);
    }

    /**
     * Intelligent matching algorithm for bank statement lines
     */
    private void matchStatementLines(BankStatement statement, BankAccount account) {
        log.info("Starting matching algorithm for statement: {}", statement.getId());
        
        List<BankStatementLine> statementLines = lineRepository.findByStatementId(statement.getId());
        
        // For now, mark all lines as unmatched (will be manually matched or integrated with GL later)
        for (BankStatementLine statementLine : statementLines) {
            if (statementLine.getMatchStatus() == null || 
                statementLine.getMatchStatus() == BankStatementLine.MatchStatus.UNMATCHED) {
                // Initialize match status
                statementLine.setMatchStatus(BankStatementLine.MatchStatus.UNMATCHED);
                lineRepository.save(statementLine);
            }
        }
        
        log.debug("Matching algorithm completed. {} lines processed", statementLines.size());
    }

    /**
     * Find exact match: same amount and date
     */
    private Optional<Long> findExactMatch(BankAccount account, BankStatementLine statementLine) {
        // Placeholder for GL integration - would match bank line to GL entry
        return Optional.empty();
    }

    /**
     * Find fuzzy match: same amount within 5 days
     */
    private Optional<Long> findFuzzyMatch(BankAccount account, BankStatementLine statementLine) {
        // Placeholder for GL integration - would match bank line to GL entry within 5-day window
        return Optional.empty();
    }

    /**
     * Mark line as matched
     */
    private void matchLine(BankStatementLine statementLine, Long journalLineId) {
        statementLine.setMatchStatus(BankStatementLine.MatchStatus.MATCHED);
        statementLine.setMatchedJournalLineId(journalLineId);
        lineRepository.save(statementLine);
        log.debug("Matched statement line: {} to journal line: {}", statementLine.getId(), journalLineId);
    }

    /**
     * Manually match statement line to GL entry
     */
    public void manualMatchLine(Long statementLineId, Long journalLineId, String userId) {
        log.info("Manual matching statement line: {} to journal line: {}", statementLineId, journalLineId);
        
        BankStatementLine statementLine = lineRepository.findById(statementLineId)
                .orElseThrow(() -> new RuntimeException("Statement line not found"));
        
        matchLine(statementLine, journalLineId);
    }

    /**
     * Unmatch a previously matched line
     */
    public void unmatchLine(Long statementLineId) {
        log.info("Unmatching statement line: {}", statementLineId);
        
        BankStatementLine statementLine = lineRepository.findById(statementLineId)
                .orElseThrow(() -> new RuntimeException("Statement line not found"));
        
        statementLine.setMatchStatus(BankStatementLine.MatchStatus.UNMATCHED);
        statementLine.setMatchedJournalLineId(null);
        lineRepository.save(statementLine);
    }

    /**
     * Get reconciliation report
     */
    public BankReconciliationReportDto getReconciliationReport(Long reconciliationId) {
        log.info("Getting reconciliation report: {}", reconciliationId);
        
        BankReconciliation reconciliation = reconciliationRepository.findById(reconciliationId)
                .orElseThrow(() -> new RuntimeException("Reconciliation not found"));
        
        List<BankStatementLine> allLines = lineRepository.findByStatementId(reconciliation.getStatement().getId());
        List<BankStatementLine> unmatchedLines = lineRepository.findByStatementAndMatchStatus(
                reconciliation.getStatement().getId(), BankStatementLine.MatchStatus.UNMATCHED);
        
        // Calculate totals
        BigDecimal unmatchedAmount = unmatchedLines.stream()
                .map(BankStatementLine::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return BankReconciliationReportDto.builder()
                .reconciliationId(reconciliation.getId())
                .accountNumber(reconciliation.getBankAccount().getAccountNumber())
                .statementDate(reconciliation.getStatement().getStatementDate())
                .glBalance(reconciliation.getGlBalance())
                .bankBalance(reconciliation.getBankBalance())
                .difference(reconciliation.getDifference())
                .totalLines(allLines.size())
                .matchedCount(reconciliation.getMatchedCount())
                .unmatchedCount(reconciliation.getUnmatchedCount())
                .unmatchedAmount(unmatchedAmount)
                .status(reconciliation.getStatus().toString())
                .unmatchedLines(unmatchedLines)
                .build();
    }
}
