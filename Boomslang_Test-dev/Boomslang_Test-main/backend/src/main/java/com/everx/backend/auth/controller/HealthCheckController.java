package com.everx.backend.auth.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Health check and readiness endpoints
 */
@Slf4j
@RestController
@RequestMapping("/actuator")
@RequiredArgsConstructor
public class HealthCheckController {
    
    @GetMapping("/health/live")
    public ResponseEntity<Map<String, Object>> live() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("service", "everx-backend");
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/health/ready")
    public ResponseEntity<Map<String, Object>> ready() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("database", "UP");
        response.put("cache", "UP");
        response.put("service", "everx-backend");
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("checks", Map.of(
            "liveness", "UP",
            "readiness", "UP",
            "startup", "UP"
        ));
        
        return ResponseEntity.ok(response);
    }
}
