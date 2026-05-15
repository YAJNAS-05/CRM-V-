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
import java.util.LinkedHashSet;
import java.util.List;
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
                List<String> roles = tokenProvider.getRolesFromToken(jwt);
                List<String> permissions = tokenProvider.getPermissionsFromToken(jwt);

                if (userId != null && email != null) {
                    LinkedHashSet<org.springframework.security.core.GrantedAuthority> authorities = new LinkedHashSet<>();

                    if ((roles == null || roles.isEmpty()) && role != null) {
                        roles = List.of(role);
                    }

                    if (roles != null) {
                        for (String roleName : roles) {
                            if (roleName != null && !roleName.isBlank()) {
                                authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + roleName));
                            }
                        }
                    }

                    if (permissions != null) {
                        for (String permission : permissions) {
                            if (permission != null && !permission.isBlank()) {
                                authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority(permission));
                            }
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
                    request.setAttribute("userRole", role != null ? role : (roles == null || roles.isEmpty() ? null : roles.get(0)));
                    request.setAttribute("userRoles", roles);
                    request.setAttribute("userPermissions", permissions);
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
