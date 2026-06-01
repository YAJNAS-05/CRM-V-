package com.everx.finance.batch;

import com.everx.finance.service.FixedAssetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.YearMonth;

@Component
@RequiredArgsConstructor
@Slf4j
public class DepreciationBatchJob {
    private final FixedAssetService fixedAssetService;

    /**
     * Run monthly depreciation calculation and posting
     * Scheduled for first day of month at 1 AM
     */
    @Scheduled(cron = "0 0 1 1 * *")
    public void runMonthlyDepreciation() {
        log.info("Starting monthly depreciation batch job");
        
        try {
            YearMonth previousMonth = YearMonth.now().minusMonths(1);
            
            // Calculate depreciation
            fixedAssetService.calculateMonthlyDepreciation(previousMonth);
            log.info("Depreciation calculated for month: {}", previousMonth);
            
            // Post to GL
            fixedAssetService.postDepreciationToGl(previousMonth, "BATCH");
            log.info("Depreciation posted to GL for month: {}", previousMonth);
            
        } catch (Exception e) {
            log.error("Error in depreciation batch job", e);
        }
    }
}
