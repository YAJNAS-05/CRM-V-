package com.everx.finance.currency;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class CurrencyRateScheduler {

    private final CurrencyRateService currencyRateService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${everx.currency-api.url:https://api.exchangerate-api.com/v4/latest}")
    private String apiUrl;

    /**
     * Daily at 1 AM: Fetch and store latest currency rates.
     */
    @Scheduled(cron = "0 0 1 * * *")
    @SchedulerLock(name = "fetchLatestRates", lockAtMostFor = "30m", lockAtLeastFor = "2m")
    public void fetchLatestRates() {
        log.info("Running scheduled job: fetchLatestRates from {}", apiUrl);
        try {
            // Fetching rates for AUD as base for the company
            String url = apiUrl + "/AUD";
            
            // Using ParameterizedTypeReference to avoid unchecked conversion warnings
            ParameterizedTypeReference<Map<String, Object>> typeRef = new ParameterizedTypeReference<>() {};
            ResponseEntity<Map<String, Object>> entity = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, null, typeRef);
            Map<String, Object> response = entity.getBody();
            
            if (response != null) {
                Object ratesObj = response.get("rates");
                if (ratesObj instanceof Map<?, ?>) {
                    @SuppressWarnings("unchecked")
                    Map<String, Double> rates = (Map<String, Double>) ratesObj;
                    
                    updateRate("AUD", "USD", rates);
                    updateRate("AUD", "JPY", rates);
                    
                    // Also update reverse for convenience
                    Double usdRate = rates.get("USD");
                    Double jpyRate = rates.get("JPY");
                    
                    if (usdRate != null) {
                        updateRate("USD", "AUD", 1.0 / usdRate);
                    }
                    if (jpyRate != null) {
                        updateRate("JPY", "AUD", 1.0 / jpyRate);
                    }
                    
                    log.info("Currency rates updated successfully.");
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch currency rates: {}", e.getMessage());
        }
    }

    private void updateRate(String base, String target, Map<String, Double> rates) {
        if (rates.containsKey(target)) {
            Double rate = rates.get(target);
            if (rate != null) {
                currencyRateService.updateRate(base, target, BigDecimal.valueOf(rate));
            }
        }
    }

    private void updateRate(String base, String target, double rate) {
        currencyRateService.updateRate(base, target, BigDecimal.valueOf(rate));
    }
}
