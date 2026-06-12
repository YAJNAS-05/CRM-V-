package com.everx.config;

import com.everx.reporting.entity.ReportDefinitionEntity;
import com.everx.reporting.repository.ReportDefinitionRepository;
import com.everx.reporting.service.ReportDefinitionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Seeds standard analytics reports (Freshservice-style catalog) for local and first-run environments.
 */
@Slf4j
@Component
@Order(20)
@RequiredArgsConstructor
public class ReportingSeedInitializer implements ApplicationRunner {

    private final ReportDefinitionRepository reportDefinitionRepository;
    private final ReportDefinitionService reportDefinitionService;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        try {
            if (reportDefinitionRepository.count() > 0) {
                return;
            }

            log.info("Seeding default reporting catalog...");
            seedReport("sales-pipeline", "Sales Pipeline", "CRM",
                    "Pipeline value and stage distribution", standardColumns("stage", "amount", "owner"));
            seedReport("lead-conversion", "Lead Conversion", "CRM",
                    "Lead conversion rates by source", standardColumns("source", "converted", "rate"));
            seedReport("customer-activity", "Customer Activity", "CRM",
                    "Customer touchpoints and engagement", standardColumns("account", "activity", "date"));
            seedReport("service-tickets", "Service Tickets", "ERP",
                    "Ticket volume, SLA, and resolution trends", standardColumns("status", "priority", "count"));
            seedReport("inventory-stock", "Inventory Stock", "ERP",
                    "Stock levels and movement summary", standardColumns("sku", "onHand", "reorder"));
            seedReport("purchase-orders", "Purchase Orders", "ERP",
                    "PO status and supplier performance", standardColumns("supplier", "status", "amount"));
            seedReport("financial-summary", "Financial Summary", "FINANCE",
                    "Income, expense, and cash position", standardColumns("category", "actual", "budget"));
            seedReport("invoices-aging", "Invoices Aging", "FINANCE",
                    "AR aging buckets and overdue totals", standardColumns("bucket", "amount", "count"));

            log.info("Reporting catalog seeded with {} standard reports", 8);
        } catch (Exception ex) {
            log.error("Failed to seed reporting catalog (application will continue)", ex);
        }
    }

    private void seedReport(String key, String name, String module, String description, Map<String, Object> definition) {
        if (reportDefinitionRepository.findByReportKey(key).isPresent()) {
            return;
        }

        ReportDefinitionEntity entity = ReportDefinitionEntity.builder()
                .reportKey(key)
                .reportName(name)
                .reportType("STANDARD")
                .module(module)
                .description(description)
                .definition(reportDefinitionService.normalizeDefinition(definition))
                .createdBy("system")
                .ownedBy("system")
                .isSystem(true)
                .isActive(true)
                .runCount(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        reportDefinitionRepository.save(entity);
    }

    private Map<String, Object> standardColumns(String... fields) {
        Map<String, Object> definition = new LinkedHashMap<>();
        definition.put("columns", List.of(fields));
        definition.put("defaultPageSize", 50);
        definition.put("supportsExport", true);
        definition.put("supportsScheduling", true);
        return definition;
    }
}
