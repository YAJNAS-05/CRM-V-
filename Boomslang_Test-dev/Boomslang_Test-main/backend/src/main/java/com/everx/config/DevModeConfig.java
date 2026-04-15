package com.everx.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.*;

/**
 * Development Mode Configuration
 * Provides mock authentication and bypasses security checks for development
 * Remove or disable in production
 */
@Configuration
public class DevModeConfig {
    
    /**
     * Mock authentication for development
     * Allows unauthenticated requests to proceed with ADMIN role
     */
    @Bean
    public MockAuthenticationProvider mockAuthenticationProvider() {
        return new MockAuthenticationProvider();
    }

    /**
     * Mock Authentication Implementation
     */
    public static class MockAuthenticationImpl implements Authentication {
        private static final long serialVersionUID = 1L;
        private String name = "dev-user";
        private boolean authenticated = true;
        private Map<String, Object> details = new HashMap<>();

        public MockAuthenticationImpl(String name) {
            this.name = name;
        }

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            List<GrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
            authorities.add(new SimpleGrantedAuthority("ROLE_FINANCE"));
            authorities.add(new SimpleGrantedAuthority("ROLE_SALES_MANAGER"));
            authorities.add(new SimpleGrantedAuthority("ROLE_SALES_REP"));
            return authorities;
        }

        @Override
        public Object getCredentials() {
            return "mock-password";
        }

        @Override
        public Object getDetails() {
            return details;
        }

        @Override
        public Object getPrincipal() {
            return name;
        }

        @Override
        public boolean isAuthenticated() {
            return authenticated;
        }

        @Override
        public void setAuthenticated(boolean b) throws IllegalArgumentException {
            this.authenticated = b;
        }

        @Override
        public String getName() {
            return name;
        }
    }

    /**
     * Mock Authentication Provider
     */
    public static class MockAuthenticationProvider {
        public static Authentication getMockAuthentication() {
            return new MockAuthenticationImpl("dev-user");
        }
    }
}
