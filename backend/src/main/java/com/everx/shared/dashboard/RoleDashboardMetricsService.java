package com.everx.shared.dashboard;

import com.everx.crm.deal.DealRepository;
import com.everx.erp.fieldwork.FieldJobRepository;
import com.everx.finance.invoice.Invoice;
import com.everx.finance.invoice.InvoiceRepository;
import com.everx.hr.EmployeeStatus;
import com.everx.hr.LeaveStatus;
import com.everx.hr.ReimbursementStatus;
import com.everx.hr.TimesheetStatus;
import com.everx.hr.employee.EmployeeRepository;
import com.everx.hr.leave.LeaveRequestRepository;
import com.everx.hr.payroll.PayrollItemRepository;
import com.everx.hr.payroll.PayrollRun;
import com.everx.hr.payroll.PayrollRunRepository;
import com.everx.hr.position.PositionRepository;
import com.everx.hr.reimbursement.ReimbursementRepository;
import com.everx.hr.timesheet.TimesheetRepository;
import com.everx.shared.dashboard.dto.FinanceDashboardMetrics;
import com.everx.shared.dashboard.dto.HRDashboardMetrics;
import com.everx.shared.dashboard.dto.OperationsDashboardMetrics;
import com.everx.shared.dashboard.dto.ComposedDashboardMetrics;
import com.everx.shared.dashboard.dto.DashboardMetricWidget;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoleDashboardMetricsService {

        private static final List<String> TEAM_SCOPE_ROLES = List.of("SUPER_ADMIN", "ADMIN", "MANAGER", "SALES_MANAGER", "EXECUTIVE");

    private final InvoiceRepository invoiceRepository;
    private final EmployeeRepository employeeRepository;
    private final DealRepository dealRepository;
    private final FieldJobRepository fieldworkRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final TimesheetRepository timesheetRepository;
        private final PositionRepository positionRepository;
        private final PayrollRunRepository payrollRunRepository;
        private final PayrollItemRepository payrollItemRepository;
        private final ReimbursementRepository reimbursementRepository;

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
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate monthEnd = today.withDayOfMonth(today.lengthOfMonth());

        long total = employeeRepository.countByIsDeletedFalse();
        long active = employeeRepository.countByStatusAndIsDeletedFalse(EmployeeStatus.ACTIVE);
        long newHiresThisMonth = employeeRepository.countByHireDateBetweenAndIsDeletedFalse(monthStart, monthEnd);
        long terminationsThisMonth = employeeRepository.countByTerminationDateBetweenAndIsDeletedFalse(monthStart, monthEnd);

        long pendingLeaves = leaveRequestRepository.countByStatusAndIsDeletedFalse(LeaveStatus.REQUESTED);
        long approvedLeaves = leaveRequestRepository.countByStatusAndIsDeletedFalse(LeaveStatus.APPROVED);
        long upcomingLeaves = leaveRequestRepository.countByStatusAndStartDateBetweenAndIsDeletedFalse(
                LeaveStatus.APPROVED, today, today.plusDays(30)
        );
        long pendingTimesheets = timesheetRepository.countByStatusAndIsDeletedFalse(TimesheetStatus.SUBMITTED);

        long openPositions = positionRepository.countByIsDeletedFalse();
        long pendingReimbursements = reimbursementRepository.countByStatusAndIsDeletedFalse(ReimbursementStatus.SUBMITTED);

        double attritionRate = total > 0
                ? Math.min(100, (double) terminationsThisMonth / total * 100)
                : 0;
        double complianceRate = total > 0
                ? Math.max(0, 100 - ((pendingLeaves + pendingTimesheets) * 100.0 / total))
                : 0;
        int trainingCompleted = total > 0
                ? (int) Math.round(Math.max(0, Math.min(100, (double) (total - Math.min(total, pendingTimesheets)) / total * 100)))
                : 0;

        BigDecimal nextPayrollAmount = BigDecimal.ZERO;
        int daysToNextPayRun = 0;

        Optional<PayrollRun> nextRun = payrollRunRepository
                .findTopByIsDeletedFalseAndPeriodEndGreaterThanEqualOrderByPeriodEndAsc(today);
        if (nextRun.isPresent()) {
            PayrollRun run = nextRun.get();
            nextPayrollAmount = payrollItemRepository.sumGrossPayByPayrollRunId(run.getId());
            daysToNextPayRun = (int) ChronoUnit.DAYS.between(today, run.getPeriodEnd());
        } else {
            Optional<PayrollRun> latestRun = payrollRunRepository.findTopByIsDeletedFalseOrderByPeriodEndDesc();
            if (latestRun.isPresent()) {
                nextPayrollAmount = payrollItemRepository.sumGrossPayByPayrollRunId(latestRun.get().getId());
            }
        }

        long onboardingInProgress = employeeRepository.countByHireDateAfterAndIsDeletedFalse(today.minusDays(90));

        return HRDashboardMetrics.builder()
                .totalEmployees(total)
                .activeEmployees(active)
                .newHiresThisMonth(newHiresThisMonth)
                .attritionRate(attritionRate)
                .pendingLeaves(pendingLeaves)
                .approvedLeaves(approvedLeaves)
                .upcomingLeaves(upcomingLeaves)
                .pendingTimesheets(pendingTimesheets)
                .complianceRate(complianceRate)
                .openPositions(openPositions)
                .trainingCompleted(trainingCompleted)
                .pendingReimbursements((int) pendingReimbursements)
                .nextPayrollAmount(nextPayrollAmount)
                .daysToNextPayRun(daysToNextPayRun)
                .visasExpiring(0)
                .onboardingInProgress(onboardingInProgress)
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

    public ComposedDashboardMetrics composeDashboard(List<String> roles, List<String> permissions) {
        List<String> normalizedRoles = roles == null ? List.of() : roles;
        List<String> normalizedPermissions = permissions == null ? List.of() : permissions;

        boolean hasFinanceView = normalizedPermissions.contains("FINANCE_VIEW") || normalizedPermissions.contains("DASHBOARD_FINANCE_VIEW");
        boolean hasHrView = normalizedPermissions.contains("HR_VIEW") || normalizedPermissions.contains("DASHBOARD_HR_VIEW");
        boolean hasOpsView = normalizedPermissions.contains("DASHBOARD_OPERATIONS_VIEW")
                || normalizedPermissions.contains("ERP_VIEW")
                || normalizedPermissions.contains("FIELDWORK_VIEW");

        String scope = normalizedRoles.stream().anyMatch(TEAM_SCOPE_ROLES::contains) ? "TEAM" : "SELF";
        List<DashboardMetricWidget> widgets = new ArrayList<>();

        OperationsDashboardMetrics operationsMetrics = hasOpsView || (!hasFinanceView && !hasHrView)
                ? getOperationsMetrics()
                : null;
        if (operationsMetrics != null) {
            widgets.add(DashboardMetricWidget.builder()
                    .key("ops-open-deals")
                    .title("Open Deals")
                    .type("metric")
                    .value(operationsMetrics.getOpenDeals())
                    .build());
            widgets.add(DashboardMetricWidget.builder()
                    .key("ops-sla-compliance")
                    .title("SLA Compliance")
                    .type("metric")
                    .value(operationsMetrics.getSlaCompliance())
                    .build());
        }

        if (hasFinanceView) {
            FinanceDashboardMetrics financeMetrics = getFinanceMetrics();
            widgets.add(DashboardMetricWidget.builder()
                    .key("fin-total-revenue")
                    .title("Total Revenue")
                    .type("currency")
                    .value(financeMetrics.getTotalRevenue())
                    .build());
            widgets.add(DashboardMetricWidget.builder()
                    .key("fin-outstanding")
                    .title("Outstanding")
                    .type("currency")
                    .value(financeMetrics.getTotalOutstanding())
                    .build());
            widgets.add(DashboardMetricWidget.builder()
                    .key("fin-overdue-invoices")
                    .title("Overdue Invoices")
                    .type("metric")
                    .value(financeMetrics.getOverdueInvoices())
                    .build());
        }

        if (hasHrView) {
            HRDashboardMetrics hrMetrics = getHRMetrics();
            widgets.add(DashboardMetricWidget.builder()
                    .key("hr-total-employees")
                    .title("Total Employees")
                    .type("metric")
                    .value(hrMetrics.getTotalEmployees())
                    .build());
            widgets.add(DashboardMetricWidget.builder()
                    .key("hr-pending-leaves")
                    .title("Pending Leaves")
                    .type("metric")
                    .value(hrMetrics.getPendingLeaves())
                    .build());
            widgets.add(DashboardMetricWidget.builder()
                    .key("hr-pending-timesheets")
                    .title("Pending Timesheets")
                    .type("metric")
                    .value(hrMetrics.getPendingTimesheets())
                    .build());
        }

        return ComposedDashboardMetrics.builder()
                .scope(scope)
                .roles(normalizedRoles)
                .widgets(widgets)
                .generatedAt(LocalDateTime.now())
                .build();
    }
}
