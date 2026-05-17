package com.everx.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class SupabaseAdminService {

    private final String supabaseUrl;
    private final String serviceRoleKey;
    private final RestTemplate restTemplate = new RestTemplate();

    public SupabaseAdminService(@Value("${SUPABASE_URL:}") String supabaseUrl,
                                @Value("${SUPABASE_SERVICE_ROLE_KEY:}") String serviceRoleKey) {
        this.supabaseUrl = supabaseUrl;
        this.serviceRoleKey = serviceRoleKey;
    }

    private void ensureSupabaseConfigured() {
        if (supabaseUrl == null || supabaseUrl.isBlank() || serviceRoleKey == null || serviceRoleKey.isBlank()) {
            throw new IllegalStateException("Supabase admin integration is disabled. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable it.");
        }
    }

    public Map<String, Object> createUser(String email, String password, Map<String, Object> userMetadata) {
        ensureSupabaseConfigured();
        String url = supabaseUrl.endsWith("/") ? supabaseUrl + "auth/v1/admin/users" : supabaseUrl + "/auth/v1/admin/users";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(serviceRoleKey);
        headers.add("apikey", serviceRoleKey);

        Map<String, Object> body = new HashMap<>();
        body.put("email", email);
        if (password != null) body.put("password", password);
        if (userMetadata != null) body.put("user_metadata", userMetadata);

        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);
        ResponseEntity<Map> resp = restTemplate.postForEntity(url, req, Map.class);
        return resp.getBody();
    }

    public Map<String, Object> inviteUser(String email, String redirectTo) {
        ensureSupabaseConfigured();
        String url = supabaseUrl.endsWith("/") ? supabaseUrl + "auth/v1/admin/invite" : supabaseUrl + "/auth/v1/admin/invite";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(serviceRoleKey);
        headers.add("apikey", serviceRoleKey);

        Map<String, Object> body = new HashMap<>();
        body.put("email", email);
        if (redirectTo != null) body.put("redirect_to", redirectTo);

        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);
        ResponseEntity<Map> resp = restTemplate.postForEntity(url, req, Map.class);
        return resp.getBody();
    }
}
