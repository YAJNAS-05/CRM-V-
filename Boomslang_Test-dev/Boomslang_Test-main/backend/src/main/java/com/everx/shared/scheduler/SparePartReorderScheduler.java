package com.everx.shared.scheduler;

import com.everx.erp.spareparts.SparePart;
import com.everx.erp.spareparts.SparePartRepository;
import com.everx.shared.service.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * Spare Parts Reorder Scheduler
 * 
 * WORKFLOW TRIGGER: Spare parts stock low
 * Monitors inventory levels and triggers reorder alerts when stock falls below reorder threshold
 * 
 * Runs daily at 7 AM UTC
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class SparePartReorderScheduler {

    private final SparePartRepository sparePartRepository;
    private final MailService mailService;

    @Value("${everx.procurement.alert-email:procurement@everx.com}")
    private String procurementEmail;

    /**
     * Daily check for low stock spare parts
     * CRON: 0 0 7 * * * (Daily at 7 AM UTC)
     */
    @Scheduled(cron = "0 0 7 * * *")
    @SchedulerLock(name = "sparePartReorder", lockAtMostFor = "55m", lockAtLeastFor = "5m")
    @Transactional
    public void checkLowStockSpareParts() {
        log.info("Starting spare parts low stock check");
        
        try {
            // Find all spare parts below reorder threshold
            List<SparePart> lowStockParts = sparePartRepository.findLowStockParts();

            if (lowStockParts.isEmpty()) {
                log.info("No low stock spare parts found");
                return;
            }

            log.info("Found {} spare parts below reorder threshold", lowStockParts.size());

            // Process each low stock part
            for (SparePart part : lowStockParts) {
                handleLowStockPart(part);
            }

        } catch (Exception e) {
            log.error("Error checking spare parts stock levels", e);
        }
    }

    /**
     * Handle a single low stock spare part
     * - Log the alert
     * - Send email notification to procurement team
     * - Suggest automatic reorder creation (future enhancement)
     */
    private void handleLowStockPart(SparePart part) {
        log.warn("ALERT: Low stock for spare part [{}]: {} - Current: {}, Threshold: {}",
                part.getId(), part.getName(), part.getStockQty(), part.getReorderPoint());

        try {
            String subject = "LOW STOCK ALERT: " + part.getName() + " (" + part.getPartNumber() + ")";
            String body = String.format(
                "Spare part '%s' (Part No: %s) has fallen below its reorder threshold.\n\n" +
                "Current Stock: %d\n" +
                "Reorder Threshold: %d\n" +
                "Category: %s\n" +
                "Warehouse: %s\n" +
                "Manufacturer: %s\n\n" +
                "Please consider placing a reorder to avoid stockout.",
                part.getName(),
                part.getPartNumber(),
                part.getStockQty() != null ? part.getStockQty() : 0,
                part.getReorderPoint() != null ? part.getReorderPoint() : 0,
                part.getCategory() != null ? part.getCategory() : "N/A",
                part.getWarehouseLocation() != null ? part.getWarehouseLocation() : "N/A",
                part.getManufacturer() != null ? part.getManufacturer() : "N/A"
            );
            mailService.sendSimpleMessage(procurementEmail, subject, body);

            log.info("Processed low stock alert for part: {}", part.getName());

        } catch (Exception e) {
            log.error("Error processing low stock part alert for part ID: {}", part.getId(), e);
        }
    }

    /**
     * Optional: Method to trigger manual stock check
     * Can be called from API endpoint for on-demand checks
     */
    @Transactional
    public void triggerManualStockCheck() {
        log.info("Manual spare parts stock check triggered");
        checkLowStockSpareParts();
    }
}
