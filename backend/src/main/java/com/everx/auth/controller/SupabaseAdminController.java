package com.everx.auth.controller;

import com.everx.auth.service.SupabaseAdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/internal/supabase")
public class SupabaseAdminController {

    private final SupabaseAdminService adminService;

    public SupabaseAdminController(SupabaseAdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/create")
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        String password = (String) body.get("password");
        Map<String, Object> userMetadata = (Map<String, Object>) body.get("user_metadata");
        Map<String, Object> resp = adminService.createUser(email, password, userMetadata);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/invite")
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> inviteUser(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        String redirectTo = (String) body.get("redirect_to");
        Map<String, Object> resp = adminService.inviteUser(email, redirectTo);
        return ResponseEntity.ok(resp);
    }
}
