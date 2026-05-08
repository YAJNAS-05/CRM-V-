package com.everx.finance.scheduler;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FinancialScheduler {
    @Scheduled(cron = "0 0 2 * * ?")
    public void runDailyConsolidation() {
    }
    @Scheduled(cron = "0 0 0 1 * ?")
    public void runMonthlyClose() {
    }
}
