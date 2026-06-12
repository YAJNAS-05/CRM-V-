package com.everx.reporting.service;

import com.everx.reporting.dto.*;
import com.everx.reporting.entity.ReportDefinitionEntity;
import com.everx.reporting.repository.ReportDefinitionRepository;
import com.everx.shared.exception.ValidationException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ReportDefinitionService {

    private final ReportDefinitionRepository reportDefRepo;
    private final ObjectMapper objectMapper;

    public Page<ReportDefinitionEntity> listReports(String module, Pageable pageable) {
        if (module != null) {
            return reportDefRepo.findByModuleAndIsActive(module, true, pageable);
        }
        return reportDefRepo.findAll(pageable);
    }

    public ReportDefinitionEntity getReport(Long reportId) {
        return reportDefRepo.findById(reportId)
            .orElseThrow(() -> new IllegalArgumentException("Report not found: " + reportId));
    }

    public ReportDefinitionEntity create(CreateReportRequest request, UserDetails user) {
        if (user == null) {
            throw new SecurityException("User authentication is required to create reports");
        }
        return create(request, user.getUsername());
    }

    public ReportDefinitionEntity create(CreateReportRequest request, String ownerPrincipal) {
        if (ownerPrincipal == null || ownerPrincipal.isBlank()) {
            throw new SecurityException("User authentication is required to create reports");
        }

        if (request == null || request.getReportName() == null || request.getReportName().isBlank()) {
            throw new ValidationException("reportName", "Report name is required");
        }
        if (request.getModule() == null || request.getModule().isBlank()) {
            throw new ValidationException("module", "Module is required");
        }

        String normalizedReportName = request.getReportName().trim();
        String normalizedModule = request.getModule().trim();
        String reportKey = generateDeterministicReportKey(ownerPrincipal, normalizedModule, normalizedReportName);

        var existing = reportDefRepo.findByOwnedByIgnoreCaseAndModuleIgnoreCaseAndReportNameIgnoreCaseAndIsActiveTrue(
            ownerPrincipal,
            normalizedModule,
            normalizedReportName
        );

        if (existing.isPresent()) {
            ReportDefinitionEntity entity = existing.get();
            entity.setDescription(request.getDescription());
            entity.setDefinition(normalizeDefinition(request.getDefinition()));
            entity.setReportType("CUSTOM");
            entity.setReportKey(reportKey);
            entity.setUpdatedAt(LocalDateTime.now());
            return reportDefRepo.save(entity);
        }
        
        ReportDefinitionEntity entity = ReportDefinitionEntity.builder()
            .reportName(normalizedReportName)
            .reportKey(reportKey)
            .reportType("CUSTOM")
            .module(normalizedModule)
            .description(request.getDescription())
            .definition(normalizeDefinition(request.getDefinition()))
            .createdBy(ownerPrincipal)
            .ownedBy(ownerPrincipal)
            .isSystem(false)
            .isActive(true)
            .runCount(0)
            .build();

        try {
            return reportDefRepo.save(entity);
        } catch (DataIntegrityViolationException ex) {
            return reportDefRepo.findByReportKey(reportKey)
                .orElseThrow(() -> new ValidationException("reportName", "A report with this name already exists"));
        }
    }

    public ReportDefinitionEntity update(Long reportId, UpdateReportRequest request, UserDetails user) {
        if (user == null) {
            throw new SecurityException("User authentication is required to update reports");
        }
        return update(reportId, request, user.getUsername());
    }

    public ReportDefinitionEntity update(Long reportId, UpdateReportRequest request, String ownerPrincipal) {
        if (ownerPrincipal == null || ownerPrincipal.isBlank()) {
            throw new SecurityException("User authentication is required to update reports");
        }
        
        ReportDefinitionEntity entity = getReport(reportId);

        if (!entity.getOwnedBy().equals(ownerPrincipal)) {
            throw new SecurityException("Not authorized to update this report");
        }

        if (request == null || request.getReportName() == null || request.getReportName().isBlank()) {
            throw new ValidationException("reportName", "Report name is required");
        }

        String normalizedReportName = request.getReportName().trim();

        var duplicate = reportDefRepo.findByOwnedByIgnoreCaseAndModuleIgnoreCaseAndReportNameIgnoreCaseAndIsActiveTrue(
            entity.getOwnedBy(),
            entity.getModule(),
            normalizedReportName
        );

        if (duplicate.isPresent() && !duplicate.get().getReportId().equals(entity.getReportId())) {
            throw new ValidationException("reportName", "A report with this name already exists");
        }

        String reportKey = generateDeterministicReportKey(entity.getOwnedBy(), entity.getModule(), normalizedReportName);

        entity.setReportName(normalizedReportName);
        entity.setReportKey(reportKey);
        entity.setDescription(request.getDescription());
        entity.setDefinition(normalizeDefinition(request.getDefinition()));
        entity.setUpdatedAt(LocalDateTime.now());

        return reportDefRepo.save(entity);
    }

    public ReportDefinitionEntity clone(Long reportId, String newName, UserDetails user) {
        if (user == null) {
            throw new SecurityException("User authentication is required to clone reports");
        }
        if (newName == null || newName.isBlank()) {
            throw new ValidationException("reportName", "Report name is required");
        }
        
        ReportDefinitionEntity original = getReport(reportId);

        String normalizedName = newName.trim();
        var duplicate = reportDefRepo.findByOwnedByIgnoreCaseAndModuleIgnoreCaseAndReportNameIgnoreCaseAndIsActiveTrue(
            user.getUsername(),
            original.getModule(),
            normalizedName
        );
        if (duplicate.isPresent()) {
            throw new ValidationException("reportName", "A report with this name already exists");
        }

        String reportKey = generateDeterministicReportKey(user.getUsername(), original.getModule(), normalizedName);

        ReportDefinitionEntity cloned = ReportDefinitionEntity.builder()
            .reportName(normalizedName)
            .reportKey(reportKey)
            .reportType("CUSTOM")
            .module(original.getModule())
            .description(original.getDescription())
            .definition(original.getDefinition())
            .createdBy(user.getUsername())
            .ownedBy(user.getUsername())
            .isSystem(false)
            .isActive(true)
            .runCount(0)
            .build();

        return reportDefRepo.save(cloned);
    }

    public void delete(Long reportId) {
        ReportDefinitionEntity entity = getReport(reportId);

        if (entity.getIsSystem()) {
            throw new IllegalArgumentException("Cannot delete system reports");
        }

        reportDefRepo.deleteById(reportId);
    }

    private String generateDeterministicReportKey(String owner, String module, String reportName) {
        String keySeed = normalizeKeyPart(owner)
            + "|" + normalizeKeyPart(module)
            + "|" + normalizeKeyPart(reportName);

        return "USER_" + UUID.nameUUIDFromBytes(keySeed.getBytes(StandardCharsets.UTF_8));
    }

    private String normalizeKeyPart(String value) {
        if (value == null) {
            return "";
        }
        return value.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
    }

    /**
     * Hibernate JSON columns on H2 expect a serialized JSON payload (String), not a raw Map.
     */
    public Object normalizeDefinition(Object definition) {
        if (definition == null) {
            return "{}";
        }
        if (definition instanceof String str) {
            return str;
        }
        try {
            return objectMapper.writeValueAsString(definition);
        } catch (JsonProcessingException e) {
            throw new ValidationException("definition", "Invalid report definition JSON");
        }
    }
}
