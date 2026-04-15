package com.everx.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider", dateTimeProviderRef = "dateTimeProvider")
public class JpaConfig {

    @Bean
    public org.springframework.data.auditing.DateTimeProvider dateTimeProvider() {
        return () -> Optional.of(java.time.OffsetDateTime.now());
    }

    @Bean
    public AuditorAware<UUID> auditorProvider() {
        return () -> {
            try {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.isAuthenticated()
                        && !authentication.getPrincipal().equals("anonymousUser")) {
                    Object principal = authentication.getPrincipal();
                    if (principal instanceof UUID) {
                        return Optional.of((UUID) principal);
                    }
                }
            } catch (Exception e) {
                // User not found, return empty
            }
            return Optional.empty();
        };
    }
}
