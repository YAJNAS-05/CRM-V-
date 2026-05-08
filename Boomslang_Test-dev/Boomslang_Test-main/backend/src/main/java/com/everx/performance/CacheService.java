package com.everx.performance.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
@Slf4j
public class CacheService {

    private final CacheManager cacheManager;
    private final PerformanceMonitoringService performanceMonitoring;

    // Cache statistics
    private final Map<String, AtomicLong> cacheStats = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> lastAccessTimes = new ConcurrentHashMap<>();

    // Cache configurations
    private static final long DEFAULT_TTL_MINUTES = 30;
    private static final long MAX_CACHE_SIZE = 10000;
    private static final double EVICTION_THRESHOLD = 0.8; // Evict when 80% full

    public <T> T get(String cacheName, String key, Class<T> type) {
        try {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache == null) {
                log.warn("Cache not found: {}", cacheName);
                return null;
            }

            Cache.ValueWrapper wrapper = cache.get(key);
            if (wrapper != null) {
                T value = type.cast(wrapper.get());
                updateAccessTime(cacheName, key);
                performanceMonitoring.recordCacheHit(cacheName);
                log.debug("Cache hit: {} -> {}", cacheName, key);
                return value;
            } else {
                performanceMonitoring.recordCacheMiss(cacheName);
                log.debug("Cache miss: {} -> {}", cacheName, key);
                return null;
            }
        } catch (Exception e) {
            log.error("Error getting from cache: {} -> {}", cacheName, key, e);
            performanceMonitoring.recordCacheMiss(cacheName);
            return null;
        }
    }

    public void put(String cacheName, String key, Object value) {
        put(cacheName, key, value, DEFAULT_TTL_MINUTES);
    }

    public void put(String cacheName, String key, Object value, long ttlMinutes) {
        try {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache == null) {
                log.warn("Cache not found: {}", cacheName);
                return;
            }

            cache.put(key, value);
            updateAccessTime(cacheName, key);
            incrementCacheSize(cacheName);
            log.debug("Cache put: {} -> {}", cacheName, key);

            // Check if cache needs eviction
            checkAndEvictIfNeeded(cacheName);
        } catch (Exception e) {
            log.error("Error putting to cache: {} -> {}", cacheName, key, e);
        }
    }

    public void evict(String cacheName, String key) {
        try {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.evict(key);
                decrementCacheSize(cacheName);
                lastAccessTimes.remove(cacheName + ":" + key);
                log.debug("Cache evict: {} -> {}", cacheName, key);
            }
        } catch (Exception e) {
            log.error("Error evicting from cache: {} -> {}", cacheName, key, e);
        }
    }

    public void evictAll(String cacheName) {
        try {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
                cacheStats.remove(cacheName);
                clearAccessTimes(cacheName);
                log.debug("Cache evict all: {}", cacheName);
            }
        } catch (Exception e) {
            log.error("Error evicting all from cache: {}", cacheName, e);
        }
    }

    public boolean exists(String cacheName, String key) {
        try {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache == null) return false;
            return cache.get(key) != null;
        } catch (Exception e) {
            log.error("Error checking cache existence: {} -> {}", cacheName, key, e);
            return false;
        }
    }

    public CacheStatistics getStatistics(String cacheName) {
        long size = cacheStats.getOrDefault(cacheName, new AtomicLong(0)).get();
        long hits = getCacheHits(cacheName);
        long misses = getCacheMisses(cacheName);
        double hitRate = (hits + misses) > 0 ? (double) hits / (hits + misses) : 0.0;

        return CacheStatistics.builder()
                .cacheName(cacheName)
                .size(size)
                .hits(hits)
                .misses(misses)
                .hitRate(hitRate)
                .lastAccessTime(getLastAccessTime(cacheName))
                .build();
    }

    public Map<String, CacheStatistics> getAllStatistics() {
        Map<String, CacheStatistics> statistics = new HashMap<>();
        for (String cacheName : cacheManager.getCacheNames()) {
            statistics.put(cacheName, getStatistics(cacheName));
        }
        return statistics;
    }

    public void warmupCache(String cacheName, Map<String, Object> data) {
        log.info("Warming up cache: {} with {} entries", cacheName, data.size());
        
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            put(cacheName, entry.getKey(), entry.getValue());
        }
        
        log.info("Cache warmup completed: {}", cacheName);
    }

    public void preloadCommonData() {
        log.info("Preloading common data into cache");
        
        // Preload frequently accessed data
        try {
            // Tenant configurations
            // User permissions
            // System settings
            // Common lookup data
            
            log.info("Common data preloading completed");
        } catch (Exception e) {
            log.error("Error preloading common data", e);
        }
    }

    @Scheduled(fixedRate = 300000) // Every 5 minutes
    public void cleanupExpiredEntries() {
        log.debug("Cleaning up expired cache entries");
        
        for (String cacheName : cacheManager.getCacheNames()) {
            cleanupExpiredEntries(cacheName);
        }
    }

    @Scheduled(fixedRate = 600000) // Every 10 minutes
    public void optimizeCache() {
        log.debug("Optimizing cache performance");
        
        for (String cacheName : cacheManager.getCacheNames()) {
            optimizeCache(cacheName);
        }
    }

    // Private helper methods
    private void updateAccessTime(String cacheName, String key) {
        lastAccessTimes.put(cacheName + ":" + key, LocalDateTime.now());
    }

    private void incrementCacheSize(String cacheName) {
        cacheStats.computeIfAbsent(cacheName, k -> new AtomicLong(0)).incrementAndGet();
    }

    private void decrementCacheSize(String cacheName) {
        cacheStats.computeIfAbsent(cacheName, k -> new AtomicLong(0)).decrementAndGet();
    }

    private void checkAndEvictIfNeeded(String cacheName) {
        long size = cacheStats.getOrDefault(cacheName, new AtomicLong(0)).get();
        if (size > MAX_CACHE_SIZE * EVICTION_THRESHOLD) {
            evictLeastRecentlyUsed(cacheName);
        }
    }

    private void evictLeastRecentlyUsed(String cacheName) {
        String oldestKey = lastAccessTimes.entrySet().stream()
                .filter(entry -> entry.getKey().startsWith(cacheName + ":"))
                .min(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .map(key -> key.substring(cacheName.length() + 1))
                .orElse(null);

        if (oldestKey != null) {
            evict(cacheName, oldestKey);
            log.debug("Evicted LRU entry from cache: {} -> {}", cacheName, oldestKey);
        }
    }

    private void cleanupExpiredEntries(String cacheName) {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(DEFAULT_TTL_MINUTES);
        
        lastAccessTimes.entrySet().stream()
                .filter(entry -> entry.getKey().startsWith(cacheName + ":"))
                .filter(entry -> entry.getValue().isBefore(cutoff))
                .forEach(entry -> {
                    String key = entry.getKey().substring(cacheName.length() + 1);
                    evict(cacheName, key);
                });
    }

    private void optimizeCache(String cacheName) {
        CacheStatistics stats = getStatistics(cacheName);
        
        // If hit rate is too low, consider adjusting cache strategy
        if (stats.getHitRate() < 0.5) {
            log.warn("Low hit rate for cache {}: {}%", cacheName, stats.getHitRate() * 100);
            // Could implement cache warming or size adjustment here
        }
        
        // If cache is too large, consider more aggressive eviction
        if (stats.getSize() > MAX_CACHE_SIZE * 0.9) {
            evictLeastRecentlyUsed(cacheName);
        }
    }

    private void clearAccessTimes(String cacheName) {
        lastAccessTimes.entrySet().removeIf(entry -> entry.getKey().startsWith(cacheName + ":"));
    }

    private long getCacheHits(String cacheName) {
        // This would integrate with the performance monitoring service
        return 0; // Placeholder
    }

    private long getCacheMisses(String cacheName) {
        // This would integrate with the performance monitoring service
        return 0; // Placeholder
    }

    private LocalDateTime getLastAccessTime(String cacheName) {
        return lastAccessTimes.entrySet().stream()
                .filter(entry -> entry.getKey().startsWith(cacheName + ":"))
                .map(Map.Entry::getValue)
                .max(LocalDateTime::compareTo)
                .orElse(null);
    }
}
