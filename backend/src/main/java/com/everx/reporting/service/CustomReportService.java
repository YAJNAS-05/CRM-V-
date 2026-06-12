package com.everx.reporting.service;

import com.everx.reporting.dto.CreateReportRequest;
import com.everx.reporting.dto.CustomReportDto;
import com.everx.reporting.dto.CustomReportRequest;
import com.everx.reporting.dto.UpdateReportRequest;
import com.everx.reporting.entity.ReportDefinitionEntity;
import com.everx.reporting.export.ExportFormat;
import com.everx.reporting.export.ExportResult;
import com.everx.reporting.export.ExportService;
import com.everx.reporting.repository.ReportDefinitionRepository;
import com.everx.shared.exception.ValidationException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomReportService {

    private static final String CUSTOM_MODULE = "ANALYTICS";

    private final ReportDefinitionRepository reportDefinitionRepository;
    private final ReportDefinitionService reportDefinitionService;
    private final ExportService exportService;
    private final ObjectMapper objectMapper;

    public Page<CustomReportDto> list(Pageable pageable) {
        return reportDefinitionRepository
                .findByReportTypeAndIsActive("CUSTOM", true, pageable)
                .map(this::toDto);
    }

    public CustomReportDto get(String id) {
        return toDto(loadEntity(id));
    }

    public CustomReportDto create(CustomReportRequest request, String ownerPrincipal) {
        CreateReportRequest createRequest = CreateReportRequest.builder()
                .reportName(request.getName().trim())
                .module(CUSTOM_MODULE)
                .description(request.getDescription())
                .definition(buildDefinition(request))
                .build();
        return toDto(reportDefinitionService.create(createRequest, ownerPrincipal));
    }

    public CustomReportDto update(String id, CustomReportRequest request, String ownerPrincipal) {
        Long reportId = parseId(id);
        UpdateReportRequest updateRequest = UpdateReportRequest.builder()
                .reportName(request.getName().trim())
                .description(request.getDescription())
                .definition(buildDefinition(request))
                .build();
        return toDto(reportDefinitionService.update(reportId, updateRequest, ownerPrincipal));
    }

    public void delete(String id) {
        reportDefinitionService.delete(parseId(id));
    }

    public Map<String, Object> execute(String id, Map<String, Object> filters) {
        ReportDefinitionEntity entity = loadEntity(id);
        Map<String, Object> definition = readDefinition(entity.getDefinition());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("reportId", String.valueOf(entity.getReportId()));
        response.put("reportName", entity.getReportName());
        response.put("widgets", definition.getOrDefault("widgets", List.of()));
        response.put("filters", filters != null ? filters : Map.of());
        response.put("rows", List.of());
        response.put("executedAt", java.time.OffsetDateTime.now().toString());
        return response;
    }

    public ExportResult export(String id, ExportFormat format) {
        CustomReportDto dto = get(id);
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", dto.getId());
        row.put("name", dto.getName());
        row.put("description", dto.getDescription());
        row.put("widgetCount", dto.getWidgets() != null ? dto.getWidgets().size() : 0);

        com.everx.reporting.dto.ReportResult result = com.everx.reporting.dto.ReportResult.builder()
                .reportId(parseId(id))
                .reportName(dto.getName())
                .columns(List.of())
                .rows(List.of(row))
                .totalCount(1L)
                .page(0)
                .pageSize(1)
                .aggregates(Map.of())
                .chartData(List.of())
                .executedAt(java.time.LocalDateTime.now())
                .durationMs(1L)
                .build();

        return exportService.export(result, format, dto.getName());
    }

    public Map<String, Object> widgetOptions(String widgetType) {
        return Map.of(
                "widgetType", widgetType,
                "chartTypes", List.of("bar", "line", "pie", "area"),
                "aggregations", List.of("sum", "avg", "count", "min", "max"),
                "dataSources", List.of("/v1/crm/deals", "/v1/crm/reports/pipeline", "/v1/erp/service-tickets")
        );
    }

    public Map<String, Object> validateWidget(Map<String, Object> widget) {
        List<String> errors = new ArrayList<>();
        if (widget == null || widget.get("type") == null) {
            errors.add("Widget type is required");
        }
        if (widget != null && (widget.get("title") == null || String.valueOf(widget.get("title")).isBlank())) {
            errors.add("Widget title is required");
        }
        return Map.of("valid", errors.isEmpty(), "errors", errors);
    }

    private ReportDefinitionEntity loadEntity(String id) {
        return reportDefinitionRepository.findById(parseId(id))
                .filter(entity -> "CUSTOM".equalsIgnoreCase(entity.getReportType()))
                .orElseThrow(() -> new ValidationException("Custom report not found: " + id));
    }

    private Long parseId(String id) {
        try {
            return Long.parseLong(id);
        } catch (NumberFormatException ex) {
            throw new ValidationException("Invalid custom report id: " + id);
        }
    }

    private Map<String, Object> buildDefinition(CustomReportRequest request) {
        Map<String, Object> definition = new LinkedHashMap<>();
        definition.put("widgets", request.getWidgets() != null ? request.getWidgets() : List.of());
        definition.put("refreshRate", request.getRefreshRate() != null ? request.getRefreshRate() : 300);
        definition.put("filters", request.getFilters() != null ? request.getFilters() : Map.of());
        definition.put("engine", "widget-v2");
        return definition;
    }

    private Map<String, Object> readDefinition(Object definition) {
        if (definition == null) {
            return Map.of();
        }
        try {
            if (definition instanceof String json) {
                if (json.isBlank()) {
                    return Map.of();
                }
                return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
            }
            return objectMapper.convertValue(definition, new TypeReference<Map<String, Object>>() {});
        } catch (Exception ex) {
            return Map.of();
        }
    }

    @SuppressWarnings("unchecked")
    private CustomReportDto toDto(ReportDefinitionEntity entity) {
        Map<String, Object> definition = readDefinition(entity.getDefinition());
        return CustomReportDto.builder()
                .id(String.valueOf(entity.getReportId()))
                .name(entity.getReportName())
                .description(entity.getDescription())
                .widgets((List<Map<String, Object>>) definition.getOrDefault("widgets", List.of()))
                .refreshRate(definition.get("refreshRate") instanceof Number number
                        ? number.intValue()
                        : 300)
                .filters(definition.get("filters") instanceof Map<?, ?> map
                        ? (Map<String, Object>) map
                        : Map.of())
                .createdBy(entity.getCreatedBy())
                .ownedBy(entity.getOwnedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
