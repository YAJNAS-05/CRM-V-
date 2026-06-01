package com.everx.config;

import com.everx.auth.service.UserService;
import com.everx.shared.util.JwtTokenProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true, jsr250Enabled = true)
@Slf4j
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    public SecurityConfig(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtTokenProvider);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/refresh").permitAll()
                        .requestMatchers("/api/v1/auth/health").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/me/**").hasAuthority("INSIGHTS_VIEW")
                    .requestMatchers("/api/v1/crm/reports/**").hasAnyAuthority(
                        "DASHBOARD_SELF_VIEW",
                        "DASHBOARD_TEAM_VIEW",
                        "DASHBOARD_VIEW",
                        "REPORT_VIEW"
                    )
                    .requestMatchers(HttpMethod.GET, "/api/v1/crm/**").hasAnyAuthority("CRM_VIEW", "CRM_CREATE", "CRM_EDIT", "CRM_DELETE")
                    .requestMatchers(HttpMethod.POST, "/api/v1/crm/**").hasAnyAuthority("CRM_CREATE", "CRM_EDIT")
                    .requestMatchers(HttpMethod.PUT, "/api/v1/crm/**").hasAnyAuthority("CRM_EDIT")
                    .requestMatchers(HttpMethod.PATCH, "/api/v1/crm/**").hasAnyAuthority("CRM_EDIT")
                    .requestMatchers(HttpMethod.DELETE, "/api/v1/crm/**").hasAnyAuthority("CRM_DELETE")
                    .requestMatchers(HttpMethod.GET, "/api/v1/erp/**").hasAnyAuthority("ERP_VIEW", "ERP_CREATE", "ERP_EDIT", "ERP_DELETE")
                    .requestMatchers(HttpMethod.POST, "/api/v1/erp/**").hasAnyAuthority("ERP_CREATE", "ERP_EDIT")
                    .requestMatchers(HttpMethod.PUT, "/api/v1/erp/**").hasAnyAuthority("ERP_EDIT")
                    .requestMatchers(HttpMethod.PATCH, "/api/v1/erp/**").hasAnyAuthority("ERP_EDIT")
                    .requestMatchers(HttpMethod.DELETE, "/api/v1/erp/**").hasAnyAuthority("ERP_DELETE")
                    .requestMatchers(HttpMethod.GET, "/api/v1/hr/**").hasAnyAuthority("HR_VIEW", "HR_CREATE", "HR_EDIT", "HR_DELETE")
                    .requestMatchers(HttpMethod.POST, "/api/v1/hr/**").hasAnyAuthority("HR_CREATE", "HR_EDIT")
                    .requestMatchers(HttpMethod.PUT, "/api/v1/hr/**").hasAnyAuthority("HR_EDIT")
                    .requestMatchers(HttpMethod.PATCH, "/api/v1/hr/**").hasAnyAuthority("HR_EDIT")
                    .requestMatchers(HttpMethod.DELETE, "/api/v1/hr/**").hasAnyAuthority("HR_DELETE")
                    .requestMatchers(HttpMethod.GET, "/api/v1/finance/**").hasAnyAuthority("FINANCE_VIEW", "FINANCE_CREATE", "FINANCE_EDIT", "FINANCE_DELETE")
                    .requestMatchers(HttpMethod.POST, "/api/v1/finance/**").hasAnyAuthority("FINANCE_CREATE", "FINANCE_EDIT")
                    .requestMatchers(HttpMethod.PUT, "/api/v1/finance/**").hasAnyAuthority("FINANCE_EDIT")
                    .requestMatchers(HttpMethod.PATCH, "/api/v1/finance/**").hasAnyAuthority("FINANCE_EDIT")
                    .requestMatchers(HttpMethod.DELETE, "/api/v1/finance/**").hasAnyAuthority("FINANCE_DELETE")
                    .requestMatchers(HttpMethod.GET, "/api/v1/fieldwork/**").hasAnyAuthority("FIELDWORK_VIEW", "FIELDWORK_CREATE", "FIELDWORK_EDIT")
                    .requestMatchers(HttpMethod.POST, "/api/v1/fieldwork/**").hasAnyAuthority("FIELDWORK_CREATE", "FIELDWORK_EDIT")
                    .requestMatchers(HttpMethod.PUT, "/api/v1/fieldwork/**").hasAnyAuthority("FIELDWORK_EDIT")
                    .requestMatchers(HttpMethod.PATCH, "/api/v1/fieldwork/**").hasAnyAuthority("FIELDWORK_EDIT")
                    .requestMatchers(HttpMethod.DELETE, "/api/v1/fieldwork/**").hasAnyAuthority("FIELDWORK_EDIT")
                    .requestMatchers(HttpMethod.GET, "/api/field-jobs/**", "/api/field-jobs-test/**").hasAnyAuthority("FIELDWORK_VIEW", "FIELDWORK_CREATE", "FIELDWORK_EDIT")
                    .requestMatchers(HttpMethod.POST, "/api/field-jobs/**", "/api/field-jobs-test/**").hasAnyAuthority("FIELDWORK_CREATE", "FIELDWORK_EDIT")
                    .requestMatchers(HttpMethod.PUT, "/api/field-jobs/**", "/api/field-jobs-test/**").hasAnyAuthority("FIELDWORK_EDIT")
                    .requestMatchers(HttpMethod.PATCH, "/api/field-jobs/**", "/api/field-jobs-test/**").hasAnyAuthority("FIELDWORK_EDIT")
                    .requestMatchers(HttpMethod.DELETE, "/api/field-jobs/**", "/api/field-jobs-test/**").hasAnyAuthority("FIELDWORK_EDIT")
                    .requestMatchers("/api/v1/reports/**").hasAuthority("REPORT_VIEW")
                    .requestMatchers(HttpMethod.GET, "/api/pm/**").hasAnyAuthority("PM_VIEW", "PM_CREATE", "PM_EDIT", "PM_DELETE")
                    .requestMatchers(HttpMethod.POST, "/api/pm/**").hasAnyAuthority("PM_CREATE", "PM_EDIT")
                    .requestMatchers(HttpMethod.PUT, "/api/pm/**").hasAnyAuthority("PM_EDIT")
                    .requestMatchers(HttpMethod.PATCH, "/api/pm/**").hasAnyAuthority("PM_EDIT")
                    .requestMatchers(HttpMethod.DELETE, "/api/pm/**").hasAnyAuthority("PM_DELETE")
                        .requestMatchers("/api/v1/admin/**").authenticated()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"success\":false,\"message\":\"Unauthorized - please login\"}");
                        })
                )
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:5175",
                "http://localhost:5176",
                "http://localhost:5177",
                "http://localhost:3000",
                System.getenv("FRONTEND_URL") != null ? System.getenv("FRONTEND_URL") : "http://localhost:5173"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http, UserService userService) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        authenticationManagerBuilder
                .userDetailsService(userService)
                .passwordEncoder(passwordEncoder());
        return authenticationManagerBuilder.build();
    }
}
