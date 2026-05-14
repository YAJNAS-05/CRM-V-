package com.everx.auth.security;

import com.nimbusds.jwt.JWTClaimsSet;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

@Component
public class SupabaseAuthFilter extends OncePerRequestFilter {

    private final SupabaseJwtService jwtService;
    private final com.everx.auth.service.SupabaseUserService supabaseUserService;

    // paths to skip (public endpoints)
    private final AntPathRequestMatcher[] skipMatchers = new AntPathRequestMatcher[] {
            new AntPathRequestMatcher("/actuator/**"),
            new AntPathRequestMatcher("/auth/**"),
            new AntPathRequestMatcher("/public/**"),
            new AntPathRequestMatcher("/favicon.ico")
    };

    public SupabaseAuthFilter(SupabaseJwtService jwtService, com.everx.auth.service.SupabaseUserService supabaseUserService) {
        this.jwtService = jwtService;
        this.supabaseUserService = supabaseUserService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        for (AntPathRequestMatcher m : skipMatchers) {
            if (m.matches(request)) return true;
        }
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        try {
            JWTClaimsSet claims = jwtService.validate(token);
            String subject = claims.getSubject();
            if (subject != null) {
                // Map role claim to authority
                java.util.List<org.springframework.security.core.GrantedAuthority> authorities = new java.util.ArrayList<>();
                try {
                    String role = null;
                    Object r = claims.getClaim("role");
                    if (r != null) role = r.toString();
                    if (role == null) {
                        Object appMeta = claims.getClaim("app_metadata");
                        if (appMeta instanceof java.util.Map) {
                            Object rr = ((java.util.Map<?,?>)appMeta).get("role");
                            if (rr != null) role = rr.toString();
                        }
                    }
                    if (role != null) {
                        String roleName = "ROLE_" + role.toUpperCase();
                        authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority(roleName));
                    }
                } catch (Exception ignored) {}

                Object principal = subject;
                try {
                    principal = UUID.fromString(subject);
                } catch (Exception ignored) {
                    // Keep raw subject string when not a UUID.
                }

                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(auth);
                // expose claims if downstream needs them
                request.setAttribute("supabase.claims", claims.toJSONObject());

                // Upsert minimal user profile in local DB
                try {
                    supabaseUserService.upsertFromClaims(claims);
                } catch (Exception ignored) {}
            }
        } catch (Exception ex) {
            // invalid token - respond 401
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"invalid_token\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
