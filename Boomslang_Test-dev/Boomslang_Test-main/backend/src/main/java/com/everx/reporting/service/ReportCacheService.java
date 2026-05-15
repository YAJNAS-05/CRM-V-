package com.everx.reporting.service;

import com.everx.reporting.dto.ReportResult;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ReportCacheService {

    private static final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();
    
    private static class CacheEntry {
        final ReportResult result;
        final long expiresAt;
        
        CacheEntry(ReportResult result, long expirationMs) {
            this.result = result;
            this.expiresAt = System.currentTimeMillis() + expirationMs;
        }
        
        boolean isExpired() {
            return System.currentTimeMillis() > expiresAt;
        }
    }

    private static final Map<String, Duration> MODULE_TTL = Map.of(
        "CRM", Duration.ofMinutes(5),
        "ERP", Duration.ofMinutes(10),
        "FINANCE", Duration.ofMinutes(15),
        "CROSS", Duration.ofMinutes(10)
    );

    public Optional<ReportResult> get(String cacheKey) {
        try {
            CacheEntry entry = cache.get(cacheKey);
            if (entry != null) {
                if (!entry.isExpired()) {
                    return Optional.of(entry.result);
                } else {
                    cache.remove(cacheKey);
                }
            }
            return Optional.empty();
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public void put(String cacheKey, ReportResult result, Duration ttl) {
        try {
            long expirationMs = ttl != null ? ttl.toMillis() : Duration.ofMinutes(5).toMillis();
            cache.put(cacheKey, new CacheEntry(result, expirationMs));
        } catch (Exception e) {
            // non-fatal
        }
    }

    public void evict(Long reportId) {
        try {
            String pattern = "report:" + reportId + ":";
            cache.keySet().removeIf(key -> key.startsWith(pattern));
        } catch (Exception e) {
            // non-fatal
        }
    }

    public Duration getCacheTtl(String module) {
        return MODULE_TTL.getOrDefault(module, Duration.ofMinutes(5));
    }
}
