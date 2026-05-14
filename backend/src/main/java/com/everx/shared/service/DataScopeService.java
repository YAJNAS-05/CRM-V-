package com.everx.shared.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DataScopeService {

    public enum DataScope {
        OWN,
        TEAM,
        ORG
    }

    private static final Set<String> TEAM_SCOPE_PERMISSIONS = Set.of(
            "DASHBOARD_TEAM_VIEW",
            "REPORT_TEAM_VIEW",
            "DATA_SCOPE_TEAM",
            "DATA_SCOPE_ORG"
    );

    private static final Set<String> ORG_SCOPE_PERMISSIONS = Set.of(
            "DATA_SCOPE_ORG"
    );

    private static final Set<String> OWN_SCOPE_PERMISSIONS = Set.of(
            "DATA_SCOPE_OWN",
            "REPORT_PERSONAL_VIEW"
    );

    public DataScope resolveScope(Authentication authentication) {
        return resolveScope(authentication, null);
    }

    public DataScope resolveScope(Authentication authentication, DataScope forcedScope) {
        if (forcedScope != null) {
            return forcedScope;
        }

        if (authentication == null || !authentication.isAuthenticated()) {
            return DataScope.OWN;
        }

        Set<String> permissions = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> authority != null && !authority.startsWith("ROLE_"))
                .map(String::toUpperCase)
                .collect(Collectors.toSet());

        if (permissions.stream().anyMatch(ORG_SCOPE_PERMISSIONS::contains)) {
            return DataScope.ORG;
        }

        if (permissions.stream().anyMatch(TEAM_SCOPE_PERMISSIONS::contains)) {
            return DataScope.TEAM;
        }

        if (permissions.stream().anyMatch(OWN_SCOPE_PERMISSIONS::contains)) {
            return DataScope.OWN;
        }

        return DataScope.OWN;
    }
}
