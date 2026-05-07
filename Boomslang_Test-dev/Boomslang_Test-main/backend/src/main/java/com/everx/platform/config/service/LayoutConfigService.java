package com.everx.platform.config.service;

import com.everx.platform.config.dto.CreateLayoutConfigRequest;
import com.everx.platform.config.dto.LayoutConfigDto;
import com.everx.platform.config.dto.UpdateLayoutConfigRequest;
import com.everx.platform.config.entity.LayoutConfig;
import com.everx.platform.config.repository.LayoutConfigRepository;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.util.SecurityUserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class LayoutConfigService {

    private final LayoutConfigRepository layoutConfigRepository;
    private static final String STATUS_DRAFT = "DRAFT";
    private static final String STATUS_PUBLISHED = "PUBLISHED";

    @Transactional(readOnly = true)
    public List<LayoutConfigDto> listLayouts(String module, String entity) {
        return layoutConfigRepository.findByModuleAndEntityAndIsDeletedFalseOrderByNameAsc(module, entity)
                .stream()
                .map(LayoutConfigDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public LayoutConfigDto getDefaultLayout(String module, String entity) {
        LayoutConfig config = layoutConfigRepository
            .findByModuleAndEntityAndIsDefaultTrueAndStatusAndIsActiveTrueAndIsDeletedFalseOrderByVersionNumberDesc(
                module, entity, STATUS_PUBLISHED)
            .stream()
            .findFirst()
            .orElseGet(() -> layoutConfigRepository
                .findByModuleAndEntityAndIsDefaultTrueAndIsDeletedFalse(module, entity)
                .orElseThrow(() -> new EntityNotFoundException("Default layout not found")));
        return LayoutConfigDto.fromEntity(config);
    }

        @Transactional(readOnly = true)
        public LayoutConfigDto getActiveLayout(String module, String entity, List<String> roles) {
        List<LayoutConfig> layouts = layoutConfigRepository
            .findByModuleAndEntityAndStatusAndIsActiveTrueAndIsDeletedFalseOrderByVersionNumberDesc(
                module, entity, STATUS_PUBLISHED);

        if (layouts.isEmpty()) {
            List<LayoutConfig> legacyLayouts = layoutConfigRepository
                .findByModuleAndEntityAndIsDeletedFalseOrderByNameAsc(module, entity);
            if (legacyLayouts.isEmpty()) {
            return null;
            }
            LayoutConfig fallback = legacyLayouts.stream()
                .filter(layout -> Boolean.TRUE.equals(layout.getIsDefault()))
                .findFirst()
                .orElse(legacyLayouts.get(0));
            return LayoutConfigDto.fromEntity(fallback);
        }

        Set<String> normalizedRoles = normalizeRoles(roles);

        LayoutConfig roleMatch = layouts.stream()
            .filter(layout -> hasRoleMatch(layout.getAppliesToRoles(), normalizedRoles))
            .findFirst()
            .orElse(null);

        if (roleMatch != null) {
            return LayoutConfigDto.fromEntity(roleMatch);
        }

        LayoutConfig defaultMatch = layouts.stream()
            .filter(layout -> Boolean.TRUE.equals(layout.getIsDefault()))
            .findFirst()
            .orElse(layouts.get(0));

        return LayoutConfigDto.fromEntity(defaultMatch);
        }

    public LayoutConfigDto createLayout(CreateLayoutConfigRequest request) {
        String status = request.getStatus() != null && !request.getStatus().isBlank()
            ? request.getStatus().trim().toUpperCase(Locale.ROOT)
            : STATUS_DRAFT;

        Integer versionNumber = STATUS_PUBLISHED.equals(status)
            ? resolveNextVersion(request.getModule(), request.getEntity())
            : 1;

        LayoutConfig layout = LayoutConfig.builder()
                .module(request.getModule())
                .entity(request.getEntity())
                .name(request.getName())
                .layoutJson(request.getLayoutJson())
            .status(status)
            .versionNumber(versionNumber)
            .appliesToRoles(request.getAppliesToRoles())
            .publishedAt(STATUS_PUBLISHED.equals(status) ? OffsetDateTime.now() : null)
            .publishedBy(STATUS_PUBLISHED.equals(status) ? SecurityUserContext.getCurrentUserIdOrNull() : null)
                .isDefault(request.getIsDefault() != null ? request.getIsDefault() : false)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return LayoutConfigDto.fromEntity(layoutConfigRepository.save(layout));
    }

    public LayoutConfigDto updateLayout(UUID layoutId, UpdateLayoutConfigRequest request) {
        LayoutConfig layout = layoutConfigRepository.findById(layoutId)
                .orElseThrow(() -> new EntityNotFoundException("Layout config not found"));

        if (request.getName() != null) layout.setName(request.getName());
        if (request.getLayoutJson() != null) layout.setLayoutJson(request.getLayoutJson());
        if (request.getAppliesToRoles() != null) layout.setAppliesToRoles(request.getAppliesToRoles());
        if (request.getIsDefault() != null) layout.setIsDefault(request.getIsDefault());
        if (request.getIsActive() != null) layout.setIsActive(request.getIsActive());

        return LayoutConfigDto.fromEntity(layoutConfigRepository.save(layout));
    }

    public LayoutConfigDto publishLayout(UUID layoutId) {
        LayoutConfig layout = layoutConfigRepository.findById(layoutId)
                .orElseThrow(() -> new EntityNotFoundException("Layout config not found"));

        layout.setStatus(STATUS_PUBLISHED);
        layout.setIsActive(true);
        layout.setVersionNumber(resolveNextVersion(layout.getModule(), layout.getEntity()));
        layout.setPublishedAt(OffsetDateTime.now());
        layout.setPublishedBy(SecurityUserContext.getCurrentUserIdOrNull());

        return LayoutConfigDto.fromEntity(layoutConfigRepository.save(layout));
    }

    public void deleteLayout(UUID layoutId) {
        LayoutConfig layout = layoutConfigRepository.findById(layoutId)
                .orElseThrow(() -> new EntityNotFoundException("Layout config not found"));
        layout.softDelete();
        layoutConfigRepository.save(layout);
    }

    private Integer resolveNextVersion(String module, String entity) {
        return layoutConfigRepository
                .findByModuleAndEntityAndStatusAndIsActiveTrueAndIsDeletedFalseOrderByVersionNumberDesc(
                        module, entity, STATUS_PUBLISHED)
                .stream()
                .map(LayoutConfig::getVersionNumber)
                .filter(value -> value != null)
                .findFirst()
                .map(value -> value + 1)
                .orElse(1);
    }

    private boolean hasRoleMatch(String appliesToRoles, Set<String> userRoles) {
        if (appliesToRoles == null || appliesToRoles.isBlank() || userRoles.isEmpty()) {
            return false;
        }
        Set<String> roleTargets = normalizeRoles(parseRoles(appliesToRoles));
        for (String role : userRoles) {
            if (roleTargets.contains(role)) {
                return true;
            }
        }
        return false;
    }

    private List<String> parseRoles(String rawRoles) {
        if (rawRoles == null || rawRoles.isBlank()) {
            return List.of();
        }
        String normalized = rawRoles.trim();
        if (normalized.startsWith("[") && normalized.endsWith("]")) {
            normalized = normalized.substring(1, normalized.length() - 1);
        }
        normalized = normalized.replace("\"", "");
        if (normalized.isBlank()) {
            return List.of();
        }
        return List.of(normalized.split(","))
                .stream()
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toList();
    }

    private Set<String> normalizeRoles(List<String> roles) {
        if (roles == null || roles.isEmpty()) {
            return Collections.emptySet();
        }
        Set<String> normalized = new LinkedHashSet<>();
        for (String role : roles) {
            if (role == null || role.isBlank()) {
                continue;
            }
            String trimmed = role.trim().toUpperCase(Locale.ROOT);
            normalized.add(trimmed);
            if (trimmed.startsWith("ROLE_")) {
                normalized.add(trimmed.substring(5));
            } else {
                normalized.add("ROLE_" + trimmed);
            }
        }
        return normalized;
    }
}
