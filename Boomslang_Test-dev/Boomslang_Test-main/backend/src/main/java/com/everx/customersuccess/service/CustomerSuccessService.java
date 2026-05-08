package com.everx.customersuccess.service;

import com.everx.customersuccess.dto.CustomerSuccessManagerDTO;
import com.everx.customersuccess.dto.CustomerSuccessMetricsDTO;
import com.everx.customersuccess.dto.CustomerEngagementDTO;
import com.everx.customersuccess.dto.CustomerHealthScoreDTO;

import java.util.List;
import java.util.Map;

public interface CustomerSuccessService {
    
    // Customer Success Manager methods
    List<CustomerSuccessManagerDTO> getAllManagers();
    CustomerSuccessManagerDTO getManagerById(Long id);
    CustomerSuccessManagerDTO createManager(CustomerSuccessManagerDTO managerDTO);
    CustomerSuccessManagerDTO updateManager(Long id, CustomerSuccessManagerDTO managerDTO);
    void deleteManager(Long id);
    List<CustomerSuccessManagerDTO> getManagerCustomers(Long id);
    
    // Customer Success Metrics methods
    List<CustomerSuccessMetricsDTO> getAllMetrics();
    List<CustomerSuccessMetricsDTO> getMetricsByCustomer(Long customerId);
    List<CustomerSuccessMetricsDTO> getMetricsByManager(Long managerId);
    CustomerSuccessMetricsDTO createMetric(CustomerSuccessMetricsDTO metricsDTO);
    Map<String, Object> getMetricsDashboard();
    
    // Customer Engagement methods
    List<CustomerEngagementDTO> getAllEngagements();
    CustomerEngagementDTO getEngagementById(Long id);
    CustomerEngagementDTO createEngagement(CustomerEngagementDTO engagementDTO);
    CustomerEngagementDTO updateEngagement(Long id, CustomerEngagementDTO engagementDTO);
    void deleteEngagement(Long id);
    List<CustomerEngagementDTO> getEngagementsByCustomer(Long customerId);
    List<CustomerEngagementDTO> getEngagementsByManager(Long managerId);
    
    // Customer Health Score methods
    List<CustomerHealthScoreDTO> getAllHealthScores();
    List<CustomerHealthScoreDTO> getHealthScoresByCustomer(Long customerId);
    CustomerHealthScoreDTO getLatestHealthScore(Long customerId);
    CustomerHealthScoreDTO createHealthScore(CustomerHealthScoreDTO healthScoreDTO);
    Map<String, Object> getHealthScoreDashboard();
    List<CustomerHealthScoreDTO> getAtRiskCustomers();
    
    // Analytics and Reporting methods
    Map<String, Object> getAnalyticsOverview();
    Map<String, Object> getManagerPerformance(Long managerId);
    Map<String, Object> getCustomerTrends(Long customerId);
    Map<String, Object> generateReport(Map<String, Object> reportRequest);
}
