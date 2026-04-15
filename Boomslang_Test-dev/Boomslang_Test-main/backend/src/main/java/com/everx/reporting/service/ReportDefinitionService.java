package com.everx.reporting.service;

import com.everx.reporting.dto.*;
import com.everx.reporting.entity.ReportDefinitionEntity;
import com.everx.reporting.repository.ReportDefinitionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

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
        ReportDefinitionEntity entity = ReportDefinitionEntity.builder()
            .reportName(request.getReportName())
            .reportType("CUSTOM")
            .module(request.getModule())
            .description(request.getDescription())
            .definition(request.getDefinition())
            .createdBy(user.getUsername())
            .ownedBy(user.getUsername())
            .isSystem(false)
            .isActive(true)
            .runCount(0)
            .build();

        return reportDefRepo.save(entity);
    }

    public ReportDefinitionEntity update(Long reportId, UpdateReportRequest request, UserDetails user) {
        ReportDefinitionEntity entity = getReport(reportId);

        // Only owner or admin can update
        if (!entity.getOwnedBy().equals(user.getUsername())) {
            throw new SecurityException("Not authorized to update this report");
        }

        entity.setReportName(request.getReportName());
        entity.setDescription(request.getDescription());
        entity.setDefinition(request.getDefinition());
        entity.setUpdatedAt(LocalDateTime.now());

        return reportDefRepo.save(entity);
    }

    public ReportDefinitionEntity clone(Long reportId, String newName, UserDetails user) {
        ReportDefinitionEntity original = getReport(reportId);

        ReportDefinitionEntity cloned = ReportDefinitionEntity.builder()
            .reportName(newName)
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
}
