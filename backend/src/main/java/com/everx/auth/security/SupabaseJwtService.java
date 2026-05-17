package com.everx.auth.security;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.JWSKeySelector;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import com.nimbusds.jose.jwk.source.JWKSetCache;
import com.nimbusds.jose.jwk.source.DefaultJWKSetCache;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.concurrent.TimeUnit;

@Component
public class SupabaseJwtService {

    private final ConfigurableJWTProcessor<SecurityContext> jwtProcessor;
    private final boolean enabled;

    public SupabaseJwtService(@Value("${SUPABASE_URL:}") String supabaseUrl) throws MalformedURLException {
        if (supabaseUrl == null || supabaseUrl.isBlank()) {
            this.enabled = false;
            this.jwtProcessor = null;
            return;
        }
        this.enabled = true;

        String jwksUrl = supabaseUrl.endsWith("/") ? supabaseUrl + "auth/v1/.well-known/jwks.json" : supabaseUrl + "/auth/v1/.well-known/jwks.json";

        // cache JWK set for a short period (10 min refresh, 60 min max age)
        JWKSetCache jwkSetCache = new DefaultJWKSetCache(10L, 60L, TimeUnit.MINUTES);
        JWKSource<SecurityContext> keySource = new RemoteJWKSet<>(new URL(jwksUrl), null, jwkSetCache);

        jwtProcessor = new DefaultJWTProcessor<>();
        JWSAlgorithm expectedJWSAlg = JWSAlgorithm.RS256;
        JWSKeySelector<SecurityContext> keySelector = new JWSVerificationKeySelector<>(expectedJWSAlg, keySource);
        jwtProcessor.setJWSKeySelector(keySelector);
    }

    public boolean isEnabled() {
        return enabled;
    }

    public JWTClaimsSet validate(String token) throws Exception {
        if (!enabled || jwtProcessor == null) {
            throw new IllegalStateException("Supabase JWT validation is disabled");
        }
        SecurityContext ctx = null;
        return jwtProcessor.process(token, ctx);
    }
}
