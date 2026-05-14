package com.everx.shared.config;

import net.javacrumbs.shedlock.core.LockProvider;
import net.javacrumbs.shedlock.provider.jdbctemplate.JdbcTemplateLockProvider;
import net.javacrumbs.shedlock.spring.annotation.EnableSchedulerLock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

/**
 * Configuration for distributed scheduler coordination with ShedLock.
 * Prevents duplicate scheduled job execution across multiple instances in Kubernetes or multi-node deployments.
 * 
 * How it works:
 * 1. Each scheduled task acquires a lock before execution
 * 2. Only one instance can hold the lock and execute the task
 * 3. Other instances wait for the lock to be released
 * 4. Prevents duplicate job execution (e.g., duplicate emails, double accounting entries)
 * 
 * Usage:
 * @Scheduled(cron = "0 0 * * * *")  // Execute hourly
 * @SchedulerLock(name = "task_name", lockAtMostFor = "10m", lockAtLeastFor = "5s")
 * public void myScheduledTask() { ... }
 * 
 * ShedLock table created by V17 migration.
 */
@Configuration
@EnableScheduling
@EnableSchedulerLock(defaultLockAtMostFor = "10m")
public class SchedulerLockConfiguration {

    /**
     * Creates LockProvider bean for JDBC-based locking.
     * Uses the shedlock table in the database to manage locks.
     */
    @Bean
    public LockProvider lockProvider(JdbcTemplate jdbcTemplate) {
        return new JdbcTemplateLockProvider(
            JdbcTemplateLockProvider.Configuration.builder()
                .withJdbcTemplate(jdbcTemplate)
                .usingDbTime()  // Use database time for lock expiration
                .build()
        );
    }

    /**
     * Task scheduler with ShedLock support.
     * Can be injected if custom task scheduling is needed.
     */
    @Bean
    public ThreadPoolTaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(10);
        scheduler.setThreadNamePrefix("shedlock-scheduler-");
        scheduler.initialize();
        return scheduler;
    }
}
