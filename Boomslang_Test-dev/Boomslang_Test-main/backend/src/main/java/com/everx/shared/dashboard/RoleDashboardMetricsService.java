package com.everx.shared.dashboard;

import com.everx.crm.deal.DealRepository;
import com.everx.erp.fieldwork.FieldJobRepository;
import com.everx.finance.invoice.Invoice;
import com.everx.finance.invoice.InvoiceRepository;
import com.everx.hr.EmployeeStatus;
import com.everx.hr.employee.EmployeeRepository;
import com.everx.hr.leave.LeaveRequestRepository;
import com.everx.hr.timesheet.TimesheetRepository;
import com.everx.shared.dashboard.dto.FinanceDashboardMetrics;
import com.everx.shared.dashboard.dto.HRDashboardMetrics;
import com.everx.shared.dashboard.dto.OperationsDashboardMetrics;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleDashboardMetricsService {

    private final InvoiceRepository invoiceRepository;
    private final EmployeeRepository employeeRepository;
    private final DealRepository dealRepository;
    private final FieldJobRepository fieldworkRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final TimesheetRepository timesheetRepository;

    public FinanceDashboardMetrics getFinanceMetrics() {
        long total = invoiceRepository.count();
        long paid = invoiceRepository.findAll().stream()
                .filter(i -> i.getStatus() == Invoice.InvoiceStatus.PAID)
                .count();
        long overdue = invoiceRepository.findAll().stream()
                .filter(i -> i.getStatus() == Invoice.InvoiceStatus.OVERDUE)
                .count();
        
        BigDecimal totalRevenue = invoiceRepository.findAll().stream()
                .filter(i -> i.getStatus() == Invoice.InvoiceStatus.PAID)
                .map(i -> i.getTotalAmount() != null ? i.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal outstanding = invoiceRepository.findAll().stream()
                .filter(i -> i.getStatus() != Invoice.InvoiceStatus.PAID && i.getStatus() != Invoice.InvoiceStatus.VOID)
                .map(i -> {
                    BigDecimal totalAmt = i.getTotalAmount() != null ? i.getTotalAmount() : BigDecimal.ZERO;
                    BigDecimal paidAmt = i.getPaidAmount() != null ? i.getPaidAmount() : BigDecimal.ZERO;
                    return totalAmt.subtract(paidAmt);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return FinanceDashboardMetrics.builder()
                .totalInvoices(total)
                .paidInvoices(paid)
                .pendingInvoices(total - paid - overdue)
                .overdueInvoices(overdue)
                .totalRevenue(totalRevenue)
                .totalOutstanding(outstanding)
                .avgDaysToPayment(28) // Mocked avg
                .collectionRate(total > 0 ? (double) paid / total * 100 : 0)
                .agingBuckets(Arrays.asList(
                    FinanceDashboardMetrics.AgingBucket.builder().label("Current").amount(outstanding.multiply(new BigDecimal("0.6"))).count(12).percentage(60).build(),
                    FinanceDashboardMetrics.AgingBucket.builder().label("1-30 Days").amount(outstanding.multiply(new BigDecimal("0.25"))).count(5).percentage(25).build(),
                    FinanceDashboardMetrics.AgingBucket.builder().label("31-60 Days").amount(outstanding.multiply(new BigDecimal("0.1"))).count(2).percentage(10).build(),
                    FinanceDashboardMetrics.AgingBucket.builder().label("61-90 Days").amount(outstanding.multiply(new BigDecimal("0.05"))).count(1).percentage(5).build(),
                    FinanceDashboardMetrics.AgingBucket.builder().label("90+ Days").amount(BigDecimal.ZERO).count(0).percentage(0).build()
                ))
                .build();
    }

    public HRDashboardMetrics getHRMetrics() {
        long total = employeeRepository.count();
        long active = employeeRepository.findAll().stream()
                .filter(e -> e.getStatus() == EmployeeStatus.ACTIVE)
                .count();
        long pendingLeaves = leaveRequestRepository.count(); // Simplified count for mock
        
        return HRDashboardMetrics.builder()
                .totalEmployees(total)
                .activeEmployees(active)
                .newHiresThisMonth(2)
                .attritionRate(3.5)
                .pendingLeaves(pendingLeaves)
                .approvedLeaves(12)
                .upcomingLeaves(5)
                .pendingTimesheets(8)
                .complianceRate(98.2)
                .openPositions(4)
                .trainingCompleted(75)
                .pendingReimbursements(3)
                .build();
    }

    public OperationsDashboardMetrics getOperationsMetrics() {
        FinanceDashboardMetrics finance = getFinanceMetrics();
        HRDashboardMetrics hr = getHRMetrics();
        
        return OperationsDashboardMetrics.builder()
                .salesPipeline(new BigDecimal("1250000"))
                .openDeals(dealRepository.count())
                .winRate(32.5)
                .fieldJobsPending(fieldworkRepository.count())
                .fieldJobsCompleted(45)
                .slaCompliance(94.0)
                .cashPosition(new BigDecimal("8200000"))
                .arOutstanding(finance.getTotalOutstanding())
                .headcount(hr.getTotalEmployees())
                .openPositions(hr.getOpenPositions())
                .pendingLeaves(hr.getPendingLeaves())
                .activeAlerts(3)
                .capacities(Arrays.asList(
                    OperationsDashboardMetrics.CapacityMetric.builder().label("Sales Team").usedPercentage(80).color("bg-blue-500").build(),
                    OperationsDashboardMetrics.CapacityMetric.builder().label("Service Technicians").usedPercentage(95).color("bg-orange-500").build(),
                    OperationsDashboardMetrics.CapacityMetric.builder().label("Finance Team").usedPercentage(60).color("bg-emerald-500").build(),
                    OperationsDashboardMetrics.CapacityMetric.builder().label("HR Team").usedPercentage(45).color("bg-indigo-500").build()
                ))
                .build();
    }
}
