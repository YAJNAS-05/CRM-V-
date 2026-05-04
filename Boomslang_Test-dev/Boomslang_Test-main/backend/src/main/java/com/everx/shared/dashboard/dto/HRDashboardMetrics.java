package com.everx.shared.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HRDashboardMetrics {
    private long totalEmployees;
    private long activeEmployees;
    private long newHiresThisMonth;
    private double attritionRate;
    private long pendingLeaves;
    private long approvedLeaves;
    private long upcomingLeaves;
    private long pendingTimesheets;
    private double complianceRate;
    private long openPositions;
    private int trainingCompleted;
    private int pendingReimbursements;
    private BigDecimal nextPayrollAmount;
    private int daysToNextPayRun;
    private long visasExpiring;
    private long onboardingInProgress;
}
