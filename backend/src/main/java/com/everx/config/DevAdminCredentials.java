package com.everx.config;

/**
 * Canonical local-dev admin credentials (H2 / integration testing).
 * Keep in sync with frontend login hints and docs/getting-started/GET_STARTED.md.
 */
public final class DevAdminCredentials {

    public static final String EMAIL = "admin@everx.com";
    public static final String PASSWORD = "password123";

    private DevAdminCredentials() {
    }
}
