package com.everx.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
            "accountDetermination",
            "reportResults"
        );

        cacheManager.setCaffeine(
            Caffeine.newBuilder()
                .maximumSize(5_000)
                .expireAfterWrite(Duration.ofHours(1))
        );

        return cacheManager;
    }
}
