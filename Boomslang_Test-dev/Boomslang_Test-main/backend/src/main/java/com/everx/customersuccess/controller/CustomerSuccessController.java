package com.everx.customersuccess.controller;

import com.everx.customersuccess.dto.CustomerSuccessManagerDTO;
import com.everx.customersuccess.dto.CustomerSuccessMetricsDTO;
import com.everx.customersuccess.dto.CustomerEngagementDTO;
import com.everx.customersuccess.dto.CustomerHealthScoreDTO;
import com.everx.customersuccess.service.CustomerSuccessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customersuccess")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CustomerSuccessController {

    @Autowired
    private CustomerSuccessService customerSuccessService;

    // Customer Success Manager endpoints
    @GetMapping("/managers")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER_SUCCESS')")
    public ResponseEntity<List<CustomerSuccessManagerDTO>> getAllManagers() {
        return ResponseEntity.ok(customerSuccessService.getAllManagers());
    }

    @GetMapping("/managers/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER_SUCCESS')")
    public ResponseEntity<CustomerSuccessManagerDTO> getManagerById(@PathVariable Long id) {
        return ResponseEntity.ok(customerSuccessService.getManagerById(id));
    }

    @PostMapping("/managers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CustomerSuccessManagerDTO> createManager(@Valid @RequestBody CustomerSuccessManagerDTO managerDTO) {
        return ResponseEntity.ok(customerSuccessService.createManager(managerDTO));
    }

    @PutMapping("/managers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CustomerSuccessManagerDTO> updateManager(@PathVariable Long id, @Valid @RequestBody CustomerSuccessManagerDTO managerDTO) {
        return ResponseEntity.ok(customerSuccessService.updateManager(id, managerDTO));
    }

    @DeleteMapping("/managers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteManager(@PathVariable Long id) {
        customerSuccessService.deleteManager(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/managers/{id}/customers")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER_SUCCESS')")
    public ResponseEntity<List<CustomerSuccessManagerDTO>> getManagerCustomers(@PathVariable Long id) {
        return ResponseEntity.ok(customerSuccessService.getManagerCustomers(id));
    }

    // Customer Success Metrics endpoints
    @GetMapping("/metrics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER_SUCCESS')")
    public ResponseEntity<List<CustomerSuccessMetricsDTO>> getAllMetrics() {
        return ResponseEntity.ok(customerSuccessService.getAllMetrics());
    }

    @GetMapping("/metrics/customer/{customerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER_SUCCESS')")
    public ResponseEntity<List<CustomerSuccessMetricsDTO>> getMetricsByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(customerSuccessService.getMetricsByCustomer(customerId));
    }

    @GetMapping("/metrics/manager/{managerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER_SUCCESS')")
    public ResponseEntity<List<CustomerSuccessMetricsDTO>> getMetricsByManager(@PathVariable Long managerId) {
        return ResponseEntity.ok(customerSuccessService.getMetricsByManager(managerId));
    }

    @PostMapping("/metrics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER_SUCCESS')")
    public ResponseEntity<CustomerSuccessMetricsDTO> createMetric(@Valid @RequestBody CustomerSuccessMetricsDTO metricsDTO) {
        return ResponseEntity.ok(customerSuccessService.createMetric(metricsDTO));
    }

    @GetMapping("/metrics/dashboard")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER_SUCCESS')")
    public ResponseEntity<?> getMetricsDashboard() {
        return ResponseEntity.ok(customerSuccessService.getMetricsDashboard());
    }

    // Customer Engagement endpoints
    @GetMapping("/engagements")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER_SUCCESS')")
    public ResponseEntity<List<CustomerEngagementDTO>> getAllEngagements() {
        return ResponseEntity.ok(customerSuccessService.getAllEngagements());
    }

    @GetMapping("/engagements/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER_SUCCESS')")
    public ResponseEntity<CustomerEngagementDTO> getEngagementById(@PathVariable Long id) {
        return ResponseEntity.ok(customerSuccessService.getEngagementById(id));
    }

    @PostMapping("/engagements")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER_SUCCESS')")
    public ResponseEntity<CustomerEngagementDTO> createEngagement(@Valid @RequestBody CustomerEngagementDTO engagementDTO) {
        return ResponseEntity.ok(customerSuccessService.createEngagement(engagementDTO));
    }

    @PutMapping("/engagements/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER_SUCCESS')")
    public ResponseEntity<CustomerEngagementDTO> updateEngagement(@PathVariable Long id, @Valid @RequestBody CustomerEngagementDTO engagementDTO) {
        return ResponseEntity.ok(customerSuccessService.updateEngagement(id, engagementDTO));
    }

    @DeleteMapping("/engagements/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEngagement(@PathVariable Long id) {
        customerSuccessService.deleteEngagement(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/engagements/customer/{customerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER_SUCCESS')")
    public ResponseEntity<List<CustomerEngagementDTO>> getEngagementsByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(customerSuccessService.getEngagementsByCustomer(customerId));
    }

    @GetMapping("/engagements/manager/{managerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER_SUCCESS')")
    public ResponseEntity<List<CustomerEngagementDTO>> getEngagementsByManager(@PathVariable Long managerId) {
        return ResponseEntity.ok(customerSuccessService.getEngagementsByManager(managerId));
    }

    // Customer Health Score endpoints
    @GetMapping("/health-scores")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER_SUCCESS')")
    public ResponseEntity<List<CustomerHealthScoreDTO>> getAllHealthScores() {
        return ResponseEntity.ok(customerSuccessService.getAllHealthScores());
    }

    @GetMapping("/health-scores/customer/{customerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER_SUCCESS')")
    public ResponseEntity<List<CustomerHealthScoreDTO>> getHealthScoresByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(customerSuccessService.getHealthScoresByCustomer(customerId));
    }

    @GetMapping("/health-scores/customer/{customerId}/latest")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER_SUCCESS')")
    public ResponseEntity<CustomerHealthScoreDTO> getLatestHealthScore(@PathVariable Long customerId) {
        return ResponseEntity.ok(customerSuccessService.getLatestHealthScore(customerId));
    }

    @PostMapping("/health-scores")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER_SUCCESS')")
    public ResponseEntity<CustomerHealthScoreDTO> createHealthScore(@Valid @RequestBody CustomerHealthScoreDTO healthScoreDTO) {
        return ResponseEntity.ok(customerSuccessService.createHealthScore(healthScoreDTO));
    }

    @GetMapping("/health-scores/dashboard")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER_SUCCESS')")
    public ResponseEntity<?> getHealthScoreDashboard() {
        return ResponseEntity.ok(customerSuccessService.getHealthScoreDashboard());
    }

    @GetMapping("/health-scores/at-risk")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER_SUCCESS')")
    public ResponseEntity<List<CustomerHealthScoreDTO>> getAtRiskCustomers() {
        return ResponseEntity.ok(customerSuccessService.getAtRiskCustomers());
    }

    // Analytics and Reporting endpoints
    @GetMapping("/analytics/overview")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER_SUCCESS')")
    public ResponseEntity<?> getAnalyticsOverview() {
        return ResponseEntity.ok(customerSuccessService.getAnalyticsOverview());
    }

    @GetMapping("/analytics/manager-performance/{managerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER_SUCCESS')")
    public ResponseEntity<?> getManagerPerformance(@PathVariable Long managerId) {
        return ResponseEntity.ok(customerSuccessService.getManagerPerformance(managerId));
    }

    @GetMapping("/analytics/customer-trends/{customerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER_SUCCESS')")
    public ResponseEntity<?> getCustomerTrends(@PathVariable Long customerId) {
        return ResponseEntity.ok(customerSuccessService.getCustomerTrends(customerId));
    }

    @PostMapping("/reports/generate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CUSTOMER_SUCCESS')")
    public ResponseEntity<?> generateReport(@RequestBody Map<String, Object> reportRequest) {
        return ResponseEntity.ok(customerSuccessService.generateReport(reportRequest));
    }
}
