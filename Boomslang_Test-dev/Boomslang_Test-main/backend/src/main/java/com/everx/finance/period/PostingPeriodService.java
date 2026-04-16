package com.everx.finance.period;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Service for managing posting periods and enforcing period locks.
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PostingPeriodService {

    private final PostingPeriodRepository postingPeriodRepository;

    /**
     * Asserts that the given posting period is OPEN.
     * Throws PostingPeriodException if the period is CLOSED or LOCKED.
     */
    @Transactional(readOnly = true)
    public void assertPeriodOpen(String companyCode, LocalDate postingDate) {
        int period = postingDate.getMonthValue();
        int year = postingDate.getYear();

        PostingPeriod pp = postingPeriodRepository
            .findByCompanyCodeAndFiscalYearAndPeriod(companyCode, year, period)
            .orElseThrow(() -> new PostingPeriodException(
                "No posting period found for " + companyCode + 
                " period " + period + "/" + year));

        if (!pp.getStatus().equals(PostingPeriod.PeriodStatus.OPEN)) {
            throw new PostingPeriodException(
                "Posting period " + period + "/" + year + 
                " for " + companyCode + " is " + pp.getStatus() + 
                ". Contact Finance to open the period."
            );
        }

        log.debug("Posting period verified: {} [{}] {}/{}", 
                  companyCode, pp.getStatus(), period, year);
    }

    /**
        * Close a posting period. Requires FINANCE_EDIT permission.
     */
    @PreAuthorize("hasAuthority('FINANCE_EDIT')")
    public PostingPeriod closePeriod(String companyCode, int year, int period, String closedBy) {
        PostingPeriod pp = postingPeriodRepository
            .findByCompanyCodeAndFiscalYearAndPeriod(companyCode, year, period)
            .orElseThrow(() -> new PostingPeriodException(
                "Posting period not found: " + companyCode + " " + year + "/" + period));

        pp.setStatus(PostingPeriod.PeriodStatus.CLOSED);
        pp.setClosedAt(LocalDateTime.now());
        pp.setClosedBy(closedBy);
        PostingPeriod saved = postingPeriodRepository.save(pp);
        
        log.info("Posting period closed: {} {}/{} by {}", 
                 companyCode, period, year, closedBy);
        return saved;
    }

    /**
        * Open a posting period. Requires FINANCE_EDIT permission.
     */
    @PreAuthorize("hasAuthority('FINANCE_EDIT')")
    public PostingPeriod openPeriod(String companyCode, int year, int period) {
        PostingPeriod pp = postingPeriodRepository
            .findByCompanyCodeAndFiscalYearAndPeriod(companyCode, year, period)
            .orElseThrow(() -> new PostingPeriodException(
                "Posting period not found: " + companyCode + " " + year + "/" + period));

        if (pp.getStatus().equals(PostingPeriod.PeriodStatus.LOCKED)) {
            throw new PostingPeriodException(
                "LOCKED periods cannot be reopened: " + companyCode + " " + year + "/" + period);
        }

        pp.setStatus(PostingPeriod.PeriodStatus.OPEN);
        pp.setOpenedAt(LocalDateTime.now());
        pp.setClosedAt(null);
        pp.setClosedBy(null);
        PostingPeriod saved = postingPeriodRepository.save(pp);
        
        log.info("Posting period opened: {} {}/{}", companyCode, period, year);
        return saved;
    }
}
