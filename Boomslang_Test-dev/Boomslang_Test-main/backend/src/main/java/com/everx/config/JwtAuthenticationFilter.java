package com.everx.config;

import com.everx.shared.util.JwtTokenProvider;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                UUID userId = tokenProvider.getUserIdFromToken(jwt);
                String email = tokenProvider.getEmailFromToken(jwt);
                String role = tokenProvider.getRoleFromToken(jwt);

                if (userId != null && email != null) {
                    java.util.List<org.springframework.security.core.GrantedAuthority> authorities = new ArrayList<>();
                    if (role != null) {
                        authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role));
                        // SUPER_ADMIN inherits all role authorities
                        if ("SUPER_ADMIN".equals(role)) {
                            authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN"));
                            authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_MANAGER"));
                            authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_SALES_MANAGER"));
                            authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_SALES_REP"));
                            authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_FINANCE"));
                            authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_SERVICE_TECH"));
                            authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_WAREHOUSE_MANAGER"));
                            authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_INVENTORY_CLERK"));
                            authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_VIEWER"));
                        }
                    }

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userId, null, authorities
                            );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    request.setAttribute("userId", userId);
                    request.setAttribute("userEmail", email);
                    request.setAttribute("userRole", role);
                }
            }
        } catch (JwtException | IllegalArgumentException e) {
            log.error("JWT validation error: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
