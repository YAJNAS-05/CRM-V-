package com.everx.shared.scheduler;

import com.everx.admin.audit.repository.AuditLogRepository;
import com.everx.finance.invoice.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * FIX #6: Data Warehouse Snapshot Scheduler
 * 
 * Runs nightly to snapshot operational data into read-only data warehouse
 * Ensures:
 * - Immutable audit trail for compliance
 * - Tax year-end reconciliation ready
 * - Historical analysis without OLTP impact
 * - GL balance verification via snapshots
 * 
 * Runs: Daily at 2 AM UTC
 * ShedLock: Prevents duplicate execution in K8s
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class DataWarehouseSnapshotScheduler {

    private final AuditLogRepository auditLogRepository;
    private final InvoiceRepository invoiceRepository;
    private final DataWarehouseService dwService;

    /**
     * Daily snapshot of audit logs to DW (immutable archive)
     */
    @Scheduled(cron = "0 0 2 * * *")
    @SchedulerLock(name = "snapshotAuditLogs", lockAtMostFor = "55m", lockAtLeastFor = "5m")
    @Transactional
    public void snapshotAuditLogs() {
        log.info("Starting daily audit log snapshot");
        try {
            LocalDate yesterday = LocalDate.now().minusDays(1);
            dwService.snapshotAuditLogsForDate(yesterday);
            log.info("Audit log snapshot completed for date: {}", yesterday);
        } catch (Exception e) {
            log.error("Error snapshotting audit logs", e);
            throw new RuntimeException("Audit log snapshot failed", e);
        }
    }

    /**
     * Daily snapshot of GL entries for balance verification
     */
    @Scheduled(cron = "0 10 2 * * *")
    @SchedulerLock(name = "snapshotGLEntries", lockAtMostFor = "55m", lockAtLeastFor = "5m")
    @Transactional
    public void snapshotGLEntries() {
        log.info("Starting daily GL entry snapshot");
        try {
            LocalDate yesterday = LocalDate.now().minusDays(1);
            dwService.snapshotGLEntriesForDate(yesterday);
            log.info("GL entry snapshot completed for date: {}", yesterday);
        } catch (Exception e) {
            log.error("Error snapshotting GL entries", e);
            throw new RuntimeException("GL entry snapshot failed", e);
        }
    }

    /**
     * Daily snapshot of invoices for tax reconciliation
     */
    @Scheduled(cron = "0 20 2 * * *")
    @SchedulerLock(name = "snapshotInvoices", lockAtMostFor = "55m", lockAtLeastFor = "5m")
    @Transactional
    public void snapshotInvoices() {
        log.info("Starting daily invoice snapshot");
        try {
            LocalDate yesterday = LocalDate.now().minusDays(1);
            dwService.snapshotInvoicesForDate(yesterday);
            log.info("Invoice snapshot completed for date: {}", yesterday);
        } catch (Exception e) {
            log.error("Error snapshotting invoices", e);
            throw new RuntimeException("Invoice snapshot failed", e);
        }
    }

    /**
     * Monthly consistency check: verify GL = AR + AP + Cash
     */
    @Scheduled(cron = "0 0 1 * * *")  // First day of month at midnight
    @SchedulerLock(name = "consistencyCheck", lockAtMostFor = "2h", lockAtLeastFor = "30m")
    @Transactional
    public void monthlyConsistencyCheck() {
        log.info("Starting monthly GL consistency check");
        try {
            dwService.performMonthlyGLConsistencyCheck();
            log.info("Monthly consistency check completed");
        } catch (Exception e) {
            log.error("Error during consistency check", e);
            throw new RuntimeException("Consistency check failed", e);
        }
    }
}
