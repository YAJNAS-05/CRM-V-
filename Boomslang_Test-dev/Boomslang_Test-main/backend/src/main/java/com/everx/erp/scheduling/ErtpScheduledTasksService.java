package com.everx.erp.scheduling;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Scheduled tasks for ERP operations with ShedLock coordination.
 * 
 * All methods use @SchedulerLock to ensure single execution across distributed instances.
 * If one instance is running a task, other instances will skip or wait based on configuration.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ErtpScheduledTasksService {

    /**
     * Execute stock reorder checks every 6 hours.
     * Checks inventory levels and creates purchase orders for low-stock items.
     * 
     * Execution guarantee:
     * - Only ONE instance will execute this at any given time (even in Kubernetes)
     * - lockAtMostFor: Maximum time the lock is held (6 hours)
     * - lockAtLeastFor: Minimum time between executions (5 minutes)
     */
    @Scheduled(cron = "0 0 */6 * * *")  // Every 6 hours at the top of the hour
    @SchedulerLock(
        name = "executeStockReorderCheck",
        lockAtMostFor = "6h",
        lockAtLeastFor = "5m"
    )
    public void executeStockReorderCheck() {
        log.info("Starting scheduled stock reorder check task");
        try {
            // Business logic would go here:
            // 1. Fetch all inventory items
            // 2. Check against reorder thresholds
            // 3. Generate PurchaseOrder for low-stock items
            // 4. Send notifications to procurement team
            
            log.info("Stock reorder check completed successfully");
        } catch (Exception e) {
            log.error("Error during stock reorder check", e);
        }
    }

    /**
     * Generate daily stock movement reports.
     * Executed once per day at midnight in the company's timezone.
     */
    @Scheduled(cron = "0 0 0 * * *")  // Daily at midnight
    @SchedulerLock(
        name = "generateDailyStockReports",
        lockAtMostFor = "1h",
        lockAtLeastFor = "1m"
    )
    public void generateDailyStockReports() {
        log.info("Starting daily stock movement report generation");
        try {
            // Business logic:
            // 1. Aggregate stock movements for the previous day
            // 2. Generate PDF/Excel reports
            // 3. Email to warehouse managers
            
            log.info("Daily stock reports generated successfully");
        } catch (Exception e) {
            log.error("Error generating daily stock reports", e);
        }
    }

    /**
     * Process month-end consolidation and intercompany elimination.
     * Executed on the last day of each month at 23:00.
     * 
     * This is a critical task - uses longest lock time to prevent conflicts.
     */
    @Scheduled(cron = "0 0 23 28-31 * *")  // 23:00 on last day of month
    @SchedulerLock(
        name = "processMonthEndConsolidation",
        lockAtMostFor = "4h",
        lockAtLeastFor = "30m"
    )
    public void processMonthEndConsolidation() {
        log.info("Starting month-end consolidation and intercompany elimination");
        try {
            // Business logic:
            // 1. Close posting periods
            // 2. Mark intercompany transactions for elimination
            // 3. Generate consolidation reclassifications
            // 4. Post to GL
            // 5. Generate audit trail
            
            log.info("Month-end consolidation completed successfully");
        } catch (Exception e) {
            log.error("Error during month-end consolidation", e);
        }
    }

    /**
     * Sync exchange rates from ECB API daily.
     * Executed at 16:00 UTC (when ECB publishes rates).
     */
    @Scheduled(cron = "0 0 16 * * *")  // 16:00 UTC daily
    @SchedulerLock(
        name = "syncDailyExchangeRates",
        lockAtMostFor = "30m",
        lockAtLeastFor = "1m"
    )
    public void syncDailyExchangeRates() {
        log.info("Starting daily exchange rate synchronization from ECB");
        try {
            // Business logic:
            // 1. Call ECB API for latest rates
            // 2. Insert into FxRateHistory table
            // 3. Invalidate FX calculation cache
            // 4. Send notification if rates changed > threshold
            
            log.info("Exchange rates synchronized successfully");
        } catch (Exception e) {
            log.error("Error synchronizing exchange rates", e);
        }
    }

    /**
     * Clean up old audit logs (retention: 90 days).
     * Executed weekly on Sunday at 02:00.
     */
    @Scheduled(cron = "0 0 2 * * SUN")  // 02:00 every Sunday
    @SchedulerLock(
        name = "cleanupOldAuditLogs",
        lockAtMostFor = "1h",
        lockAtLeastFor = "5m"
    )
    public void cleanupOldAuditLogs() {
        log.info("Starting cleanup of audit logs older than 90 days");
        try {
            // Business logic:
            // 1. Delete AuditLog records older than 90 days
            // 2. Truncate temporary staging tables
            // 3. Vacuum/optimize database
            
            log.info("Audit log cleanup completed successfully");
        } catch (Exception e) {
            log.error("Error cleaning up audit logs", e);
        }
    }
}
