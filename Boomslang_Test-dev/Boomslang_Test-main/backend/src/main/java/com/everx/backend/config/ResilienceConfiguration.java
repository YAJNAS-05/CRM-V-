package com.everx.backend.config;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.core.registry.EntryAddedEvent;
import io.github.resilience4j.core.registry.EntryRemovedEvent;
import io.github.resilience4j.core.registry.RegistryEventConsumer;
import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.retry.RetryConfig;
import io.github.resilience4j.retry.RetryRegistry;
import io.github.resilience4j.timelimiter.TimeLimiter;
import io.github.resilience4j.timelimiter.TimeLimiterConfig;
import io.github.resilience4j.timelimiter.TimeLimiterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.concurrent.TimeoutException;

/**
 * Resilience4j configuration for circuit breaker, retry, and timeout patterns
 */
@Slf4j
@Configuration
public class ResilienceConfiguration {
    
    /**
     * Circuit breaker registry bean
     */
    @Bean
    public CircuitBreakerRegistry circuitBreakerRegistry() {
        CircuitBreakerConfig defaultConfig = CircuitBreakerConfig.custom()
                .failureRateThreshold(50.0f)
                .slowCallRateThreshold(50.0f)
                .slowCallDurationThreshold(Duration.ofSeconds(2))
                .waitDurationInOpenState(Duration.ofSeconds(30))
                .permittedNumberOfCallsInHalfOpenState(3)
                .minimumNumberOfCalls(5)
                .automaticTransitionFromOpenToHalfOpenEnabled(true)
                .recordExceptions(Exception.class)
                .ignoreExceptions(IllegalArgumentException.class)
                .build();
        
        CircuitBreakerRegistry registry = CircuitBreakerRegistry.of(defaultConfig);
        
        registry.getEventPublisher()
                .onEntryAdded(event -> log.info("Circuit breaker created: {}", event.getAddedEntry().getName()))
                .onEntryRemoved(event -> log.info("Circuit breaker removed: {}", event.getRemovedEntry().getName()));
        
        return registry;
    }
    
    /**
     * Retry registry bean
     */
    @Bean
    public RetryRegistry retryRegistry() {
        RetryConfig defaultConfig = RetryConfig.custom()
                .maxAttempts(3)
                .intervalFunction(io.github.resilience4j.core.IntervalFunction.ofExponentialBackoff(500, 2))
                .retryExceptions(java.util.concurrent.TimeoutException.class, java.net.ConnectException.class)
                .ignoreExceptions(IllegalArgumentException.class)
                .build();
        
        RetryRegistry registry = RetryRegistry.of(defaultConfig);
        
        registry.getEventPublisher()
                .onEntryAdded(event -> log.info("Retry policy created: {}", event.getAddedEntry().getName()))
                .onEntryRemoved(event -> log.info("Retry policy removed: {}", event.getRemovedEntry().getName()));
        
        return registry;
    }
    
    /**
     * Time limiter registry bean
     */
    @Bean
    public TimeLimiterRegistry timeLimiterRegistry() {
        TimeLimiterConfig defaultConfig = TimeLimiterConfig.custom()
                .timeoutDuration(Duration.ofSeconds(10))
                .cancelRunningFuture(true)
                .build();
        
        TimeLimiterRegistry registry = TimeLimiterRegistry.of(defaultConfig);
        
        registry.getEventPublisher()
                .onEntryAdded(event -> log.info("Time limiter created: {}", event.getAddedEntry().getName()))
                .onEntryRemoved(event -> log.info("Time limiter removed: {}", event.getRemovedEntry().getName()));
        
        return registry;
    }
    
    /**
     * Circuit breaker for external service calls
     */
    @Bean
    public CircuitBreaker externalServiceCircuitBreaker(CircuitBreakerRegistry registry) {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(50.0f)
                .slowCallRateThreshold(50.0f)
                .slowCallDurationThreshold(Duration.ofSeconds(3))
                .waitDurationInOpenState(Duration.ofSeconds(60))
                .permittedNumberOfCallsInHalfOpenState(2)
                .minimumNumberOfCalls(10)
                .automaticTransitionFromOpenToHalfOpenEnabled(true)
                .build();
        
        return registry.circuitBreaker("externalService", config);
    }
    
    /**
     * Retry policy for database operations
     */
    @Bean
    public Retry databaseRetry(RetryRegistry registry) {
        RetryConfig config = RetryConfig.custom()
                .maxAttempts(3)
                .intervalFunction(io.github.resilience4j.core.IntervalFunction.ofExponentialBackoff(500, 2))
                .retryOnException(e -> e instanceof java.sql.SQLException)
                .build();
        
        return registry.retry("database", config);
    }
    
    /**
     * Time limiter for API calls
     */
    @Bean
    public TimeLimiter apiTimeLimiter(TimeLimiterRegistry registry) {
        TimeLimiterConfig config = TimeLimiterConfig.custom()
                .timeoutDuration(Duration.ofSeconds(10))
                .cancelRunningFuture(true)
                .build();
        
        return registry.timeLimiter("api", config);
    }
}
