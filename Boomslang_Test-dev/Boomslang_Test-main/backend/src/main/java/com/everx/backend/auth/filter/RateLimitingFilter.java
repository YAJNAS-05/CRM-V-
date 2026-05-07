package com.everx.backend.auth.filter;

import com.everx.shared.exception.RateLimitException;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiting filter using Bucket4j
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {
    
    @Value("${rate-limit.user.requests-per-minute:100}")
    private int userRequestsPerMinute;
    
    @Value("${rate-limit.ip.requests-per-minute:300}")
    private int ipRequestsPerMinute;
    
    @Value("${rate-limit.enabled:true}")
    private boolean rateLimitEnabled;
    
    // Store buckets per user ID
    private final Map<String, Bucket> userBuckets = new ConcurrentHashMap<>();
    // Store buckets per IP address
    private final Map<String, Bucket> ipBuckets = new ConcurrentHashMap<>();
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        if (!rateLimitEnabled) {
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            String clientIp = getClientIpAddress(request);
            
            // Check IP-based rate limit
            if (!checkIpRateLimit(clientIp)) {
                response.setStatus(429);
                response.setHeader("Retry-After", "60");
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Rate limit exceeded. Please try again later.\"}");
                return;
            }
            
            // Check user-based rate limit (if authenticated)
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                String username = auth.getName();
                if (!checkUserRateLimit(username)) {
                    response.setStatus(429);
                    response.setHeader("Retry-After", "60");
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"Rate limit exceeded. Please try again later.\"}");
                    return;
                }
            }
            
            filterChain.doFilter(request, response);
            
        } catch (RateLimitException e) {
            response.setStatus(429);
            response.setHeader("Retry-After", String.valueOf(e.getRetryAfterSeconds()));
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"" + e.getUserMessage() + "\"}");
        }
    }
    
    private boolean checkUserRateLimit(String username) {
        Bucket bucket = userBuckets.computeIfAbsent(username, k -> createUserBucket());
        return bucket.tryConsume(1);
    }
    
    private boolean checkIpRateLimit(String ip) {
        Bucket bucket = ipBuckets.computeIfAbsent(ip, k -> createIpBucket());
        return bucket.tryConsume(1);
    }
    
    private Bucket createUserBucket() {
        Bandwidth limit = Bandwidth.classic(userRequestsPerMinute, Refill.intervally(userRequestsPerMinute, Duration.ofMinutes(1)));
        return Bucket4j.builder()
                .addLimit(limit)
                .build();
    }
    
    private Bucket createIpBucket() {
        Bandwidth limit = Bandwidth.classic(ipRequestsPerMinute, Refill.intervally(ipRequestsPerMinute, Duration.ofMinutes(1)));
        return Bucket4j.builder()
                .addLimit(limit)
                .build();
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0];
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Don't apply rate limiting to certain endpoints
        return path.startsWith("/actuator") || 
               path.startsWith("/health") ||
               path.startsWith("/swagger") ||
               path.startsWith("/v3/api-docs");
    }
}
