package com.everx.reporting.service;

import com.everx.reporting.dto.ReportResult;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReportCacheService {

    private static final String REPORT_RESULTS_CACHE = "reportResults";
    private final CacheManager cacheManager;
    
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
            Cache cache = cacheManager.getCache(REPORT_RESULTS_CACHE);
            if (cache == null) {
                return Optional.empty();
            }

            CacheEntry entry = cache.get(cacheKey, CacheEntry.class);
            if (entry != null) {
                if (!entry.isExpired()) {
                    return Optional.of(entry.result);
                } else {
                    cache.evict(cacheKey);
                }
            }
            return Optional.empty();
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public void put(String cacheKey, ReportResult result, Duration ttl) {
        try {
            Cache cache = cacheManager.getCache(REPORT_RESULTS_CACHE);
            if (cache == null) {
                return;
            }

            long expirationMs = ttl != null ? ttl.toMillis() : Duration.ofMinutes(5).toMillis();
            cache.put(cacheKey, new CacheEntry(result, expirationMs));
        } catch (Exception e) {
            // non-fatal
        }
    }

    public void evict(Long reportId) {
        try {
            Cache cache = cacheManager.getCache(REPORT_RESULTS_CACHE);
            if (cache == null) {
                return;
            }

            String pattern = "report:" + reportId + ":";
            if (cache.getNativeCache() instanceof com.github.benmanes.caffeine.cache.Cache<?, ?> nativeCache) {
                nativeCache.asMap().keySet().removeIf(key -> key instanceof String && ((String) key).startsWith(pattern));
            }
        } catch (Exception e) {
            // non-fatal
        }
    }

    public Duration getCacheTtl(String module) {
        return MODULE_TTL.getOrDefault(module, Duration.ofMinutes(5));
    }
}
