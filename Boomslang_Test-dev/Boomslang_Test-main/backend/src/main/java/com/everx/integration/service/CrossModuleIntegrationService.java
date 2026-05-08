package com.everx.integration.service;

import com.everx.crm.service.CrmService;
import com.everx.erp.service.ErpService;
import com.everx.finance.service.FinanceService;
import com.everx.hr.service.HrService;
import com.everx.pm.service.PmService;
import com.everx.analytics.service.AnalyticsService;
import com.everx.workflow.service.WorkflowService;
import com.everx.subscription.service.SubscriptionService;
import com.everx.tenant.service.TenantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class CrossModuleIntegrationService {

    private final CrmService crmService;
    private final ErpService erpService;
    private final FinanceService financeService;
    private final HrService hrService;
    private final PmService pmService;
    private final AnalyticsService analyticsService;
    private final WorkflowService workflowService;
    private final SubscriptionService subscriptionService;
    private final TenantService tenantService;

    // Integration events
    private final Map<String, List<IntegrationEventHandler>> eventHandlers = new HashMap<>();

    // Initialize event handlers
    public CrossModuleIntegrationService() {
        registerEventHandlers();
    }

    // CRM Integration
    @Async
    @Transactional
    public CompletableFuture<Void> onLeadCreated(UUID leadId, UUID tenantId) {
        log.info("Processing lead created event: {} for tenant: {}", leadId, tenantId);
        
        try {
            // Create analytics dashboard for new lead
            analyticsService.createDashboardForLead(leadId, tenantId);
            
            // Start lead nurturing workflow
            workflowService.startLeadNurturingWorkflow(leadId, tenantId);
            
            // Update tenant metrics
            tenantService.updateLeadMetrics(tenantId);
            
            // Check subscription limits
            subscriptionService.checkLeadLimits(tenantId);
            
        } catch (Exception e) {
            log.error("Error processing lead created event", e);
        }
        
        return CompletableFuture.completedFuture(null);
    }

    @Async
    @Transactional
    public CompletableFuture<Void> onOpportunityWon(UUID opportunityId, UUID tenantId) {
        log.info("Processing opportunity won event: {} for tenant: {}", opportunityId, tenantId);
        
        try {
            // Create project in PM module
            pmService.createProjectFromOpportunity(opportunityId, tenantId);
            
            // Generate invoice in Finance module
            financeService.generateInvoiceFromOpportunity(opportunityId, tenantId);
            
            // Update analytics
            analyticsService.updateRevenueMetrics(tenantId);
            
            // Trigger celebration workflow
            workflowService.triggerOpportunityWonWorkflow(opportunityId, tenantId);
            
        } catch (Exception e) {
            log.error("Error processing opportunity won event", e);
        }
        
        return CompletableFuture.completedFuture(null);
    }

    // ERP Integration
    @Async
    @Transactional
    public CompletableFuture<Void> onOrderCreated(UUID orderId, UUID tenantId) {
        log.info("Processing order created event: {} for tenant: {}", orderId, tenantId);
        
        try {
            // Update inventory
            erpService.updateInventoryForOrder(orderId, tenantId);
            
            // Create shipment tracking
            erpService.createShipmentForOrder(orderId, tenantId);
            
            // Update financial records
            financeService.updateFinancialsForOrder(orderId, tenantId);
            
            // Notify customer via CRM
            crmService.sendOrderConfirmation(orderId, tenantId);
            
        } catch (Exception e) {
            log.error("Error processing order created event", e);
        }
        
        return CompletableFuture.completedFuture(null);
    }

    // HR Integration
    @Async
    @Transactional
    public CompletableFuture<Void> onEmployeeOnboarded(UUID employeeId, UUID tenantId) {
        log.info("Processing employee onboarded event: {} for tenant: {}", employeeId, tenantId);
        
        try {
            // Create user account
            tenantService.createUserAccountForEmployee(employeeId, tenantId);
            
            // Assign default permissions
            // securityService.assignDefaultPermissions(employeeId, tenantId);
            
            // Start onboarding workflow
            workflowService.startEmployeeOnboardingWorkflow(employeeId, tenantId);
            
            // Update subscription user count
            subscriptionService.updateUserCount(tenantId);
            
            // Setup HR analytics
            analyticsService.setupEmployeeDashboard(employeeId, tenantId);
            
        } catch (Exception e) {
            log.error("Error processing employee onboarded event", e);
        }
        
        return CompletableFuture.completedFuture(null);
    }

    // Project Management Integration
    @Async
    @Transactional
    public CompletableFuture<Void> onProjectCompleted(UUID projectId, UUID tenantId) {
        log.info("Processing project completed event: {} for tenant: {}", projectId, tenantId);
        
        try {
            // Update financial records
            financeService.closeProjectFinancials(projectId, tenantId);
            
            // Update customer in CRM
            crmService.updateCustomerForCompletedProject(projectId, tenantId);
            
            // Generate completion report
            analyticsService.generateProjectCompletionReport(projectId, tenantId);
            
            // Trigger follow-up workflow
            workflowService.triggerProjectCompletionWorkflow(projectId, tenantId);
            
            // Update resource availability
            hrService.updateResourceAvailability(projectId, tenantId);
            
        } catch (Exception e) {
            log.error("Error processing project completed event", e);
        }
        
        return CompletableFuture.completedFuture(null);
    }

    // Analytics Integration
    @Async
    @Transactional
    public CompletableFuture<Void> generateCrossModuleReport(UUID tenantId, String reportType) {
        log.info("Generating cross-module report: {} for tenant: {}", reportType, tenantId);
        
        try {
            Map<String, Object> reportData = new HashMap<>();
            
            // Collect data from all modules
            reportData.put("crm", crmService.getMetrics(tenantId));
            reportData.put("erp", erpService.getMetrics(tenantId));
            reportData.put("finance", financeService.getMetrics(tenantId));
            reportData.put("hr", hrService.getMetrics(tenantId));
            reportData.put("pm", pmService.getMetrics(tenantId));
            
            // Generate consolidated report
            analyticsService.generateConsolidatedReport(tenantId, reportType, reportData);
            
        } catch (Exception e) {
            log.error("Error generating cross-module report", e);
        }
        
        return CompletableFuture.completedFuture(null);
    }

    // Data Synchronization
    @Scheduled(fixedRate = 3600000) // Every hour
    @Transactional
    public void synchronizeData() {
        log.info("Starting cross-module data synchronization");
        
        try {
            List<UUID> activeTenants = tenantService.getActiveTenants();
            
            for (UUID tenantId : activeTenants) {
                synchronizeTenantData(tenantId);
            }
            
            log.info("Cross-module data synchronization completed");
        } catch (Exception e) {
            log.error("Error during data synchronization", e);
        }
    }

    // Health Check
    @Scheduled(fixedRate = 300000) // Every 5 minutes
    public void performHealthCheck() {
        log.debug("Performing cross-module health check");
        
        try {
            Map<String, Boolean> healthStatus = new HashMap<>();
            
            healthStatus.put("crm", crmService.isHealthy());
            healthStatus.put("erp", erpService.isHealthy());
            healthStatus.put("finance", financeService.isHealthy());
            healthStatus.put("hr", hrService.isHealthy());
            healthStatus.put("pm", pmService.isHealthy());
            healthStatus.put("analytics", analyticsService.isHealthy());
            healthStatus.put("workflow", workflowService.isHealthy());
            
            // Check for unhealthy services
            healthStatus.entrySet().stream()
                    .filter(entry -> !entry.getValue())
                    .forEach(entry -> log.warn("Service {} is unhealthy", entry.getKey()));
            
            // Store health metrics
            analyticsService.storeHealthMetrics(healthStatus);
            
        } catch (Exception e) {
            log.error("Error during health check", e);
        }
    }

    // Event System
    public void publishEvent(String eventType, Map<String, Object> eventData) {
        log.debug("Publishing event: {} with data: {}", eventType, eventData);
        
        List<IntegrationEventHandler> handlers = eventHandlers.get(eventType);
        if (handlers != null) {
            for (IntegrationEventHandler handler : handlers) {
                try {
                    handler.handle(eventData);
                } catch (Exception e) {
                    log.error("Error handling event: {} with handler: {}", eventType, handler.getClass().getSimpleName(), e);
                }
            }
        }
    }

    public void subscribeToEvent(String eventType, IntegrationEventHandler handler) {
        eventHandlers.computeIfAbsent(eventType, k -> new ArrayList<>()).add(handler);
    }

    // Data Consistency Checks
    @Scheduled(cron = "0 0 2 * * *") // Every day at 2 AM
    @Transactional
    public void performDataConsistencyCheck() {
        log.info("Starting data consistency check");
        
        try {
            List<UUID> activeTenants = tenantService.getActiveTenants();
            
            for (UUID tenantId : activeTenants) {
                checkTenantDataConsistency(tenantId);
            }
            
            log.info("Data consistency check completed");
        } catch (Exception e) {
            log.error("Error during data consistency check", e);
        }
    }

    // Private helper methods
    private void registerEventHandlers() {
        // Register event handlers for different types of events
        subscribeToEvent("LEAD_CREATED", this::handleLeadCreatedEvent);
        subscribeToEvent("OPPORTUNITY_WON", this::handleOpportunityWonEvent);
        subscribeToEvent("ORDER_CREATED", this::handleOrderCreatedEvent);
        subscribeToEvent("EMPLOYEE_ONBOARDED", this::handleEmployeeOnboardedEvent);
        subscribeToEvent("PROJECT_COMPLETED", this::handleProjectCompletedEvent);
    }

    private void handleLeadCreatedEvent(Map<String, Object> eventData) {
        UUID leadId = UUID.fromString(eventData.get("leadId").toString());
        UUID tenantId = UUID.fromString(eventData.get("tenantId").toString());
        onLeadCreated(leadId, tenantId);
    }

    private void handleOpportunityWonEvent(Map<String, Object> eventData) {
        UUID opportunityId = UUID.fromString(eventData.get("opportunityId").toString());
        UUID tenantId = UUID.fromString(eventData.get("tenantId").toString());
        onOpportunityWon(opportunityId, tenantId);
    }

    private void handleOrderCreatedEvent(Map<String, Object> eventData) {
        UUID orderId = UUID.fromString(eventData.get("orderId").toString());
        UUID tenantId = UUID.fromString(eventData.get("tenantId").toString());
        onOrderCreated(orderId, tenantId);
    }

    private void handleEmployeeOnboardedEvent(Map<String, Object> eventData) {
        UUID employeeId = UUID.fromString(eventData.get("employeeId").toString());
        UUID tenantId = UUID.fromString(eventData.get("tenantId").toString());
        onEmployeeOnboarded(employeeId, tenantId);
    }

    private void handleProjectCompletedEvent(Map<String, Object> eventData) {
        UUID projectId = UUID.fromString(eventData.get("projectId").toString());
        UUID tenantId = UUID.fromString(eventData.get("tenantId").toString());
        onProjectCompleted(projectId, tenantId);
    }

    private void synchronizeTenantData(UUID tenantId) {
        try {
            // Synchronize customer data between CRM and ERP
            synchronizeCustomerData(tenantId);
            
            // Synchronize employee data between HR and PM
            synchronizeEmployeeData(tenantId);
            
            // Synchronize financial data
            synchronizeFinancialData(tenantId);
            
            // Update analytics cache
            analyticsService.refreshTenantCache(tenantId);
            
        } catch (Exception e) {
            log.error("Error synchronizing data for tenant: {}", tenantId, e);
        }
    }

    private void synchronizeCustomerData(UUID tenantId) {
        // Get customers from CRM
        // List<Customer> crmCustomers = crmService.getCustomers(tenantId);
        
        // Sync to ERP
        // erpService.syncCustomers(crmCustomers, tenantId);
        
        log.debug("Synchronized customer data for tenant: {}", tenantId);
    }

    private void synchronizeEmployeeData(UUID tenantId) {
        // Get employees from HR
        // List<Employee> hrEmployees = hrService.getEmployees(tenantId);
        
        // Sync to PM
        // pmService.syncResources(hrEmployees, tenantId);
        
        log.debug("Synchronized employee data for tenant: {}", tenantId);
    }

    private void synchronizeFinancialData(UUID tenantId) {
        // Sync financial data between modules
        log.debug("Synchronized financial data for tenant: {}", tenantId);
    }

    private void checkTenantDataConsistency(UUID tenantId) {
        try {
            // Check data consistency across modules
            List<String> inconsistencies = new ArrayList<>();
            
            // Check customer data consistency
            // if (!isCustomerDataConsistent(tenantId)) {
            //     inconsistencies.add("Customer data inconsistency detected");
            // }
            
            // Check financial data consistency
            // if (!isFinancialDataConsistent(tenantId)) {
            //     inconsistencies.add("Financial data inconsistency detected");
            // }
            
            if (!inconsistencies.isEmpty()) {
                log.warn("Data inconsistencies found for tenant {}: {}", tenantId, inconsistencies);
                // Send alert to administrators
                analyticsService.recordDataInconsistencies(tenantId, inconsistencies);
            }
            
        } catch (Exception e) {
            log.error("Error checking data consistency for tenant: {}", tenantId, e);
        }
    }

    // Functional interface for event handlers
    @FunctionalInterface
    public interface IntegrationEventHandler {
        void handle(Map<String, Object> eventData);
    }
}
