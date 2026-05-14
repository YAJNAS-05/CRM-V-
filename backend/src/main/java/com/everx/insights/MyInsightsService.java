package com.everx.insights;

import com.everx.auth.entity.User;
import com.everx.auth.repository.UserRepository;
import com.everx.crm.account.AccountRepository;
import com.everx.crm.activity.Activity;
import com.everx.crm.activity.ActivityRepository;
import com.everx.crm.contact.ContactRepository;
import com.everx.crm.deal.DealRepository;
import com.everx.crm.lead.LeadRepository;
import com.everx.erp.fieldwork.FieldJobRepository;
import com.everx.erp.purchaseorder.PurchaseOrderRepository;
import com.everx.erp.salesorder.SalesOrderRepository;
import com.everx.finance.invoice.InvoiceRepository;
import com.everx.hr.LeaveStatus;
import com.everx.hr.TimesheetStatus;
import com.everx.hr.employee.Employee;
import com.everx.hr.employee.EmployeeRepository;
import com.everx.hr.leave.LeaveRequestRepository;
import com.everx.hr.timesheet.TimesheetRepository;
import com.everx.insights.dto.InsightItem;
import com.everx.insights.dto.InsightSection;
import com.everx.insights.dto.MyInsightsResponse;
import com.everx.reporting.repository.ReportDefinitionRepository;
import com.everx.shared.util.SecurityUserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MyInsightsService {

    private final AccountRepository accountRepository;
    private final ContactRepository contactRepository;
    private final LeadRepository leadRepository;
    private final DealRepository dealRepository;
    private final ActivityRepository activityRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final InvoiceRepository invoiceRepository;
    private final FieldJobRepository fieldJobRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final TimesheetRepository timesheetRepository;
    private final ReportDefinitionRepository reportDefinitionRepository;
    private final UserRepository userRepository;

    public MyInsightsResponse getMyInsights() {
        UUID userId = SecurityUserContext.getCurrentUserId()
                .orElseThrow(() -> new AccessDeniedException("User not authenticated"));

        List<InsightSection> sections = new ArrayList<>();

        if (hasAnyAuthority("CRM_VIEW", "CRM_CREATE", "CRM_EDIT", "CRM_DELETE")) {
            long leadCount = leadRepository.countByOwnerIdAndIsDeletedFalse(userId);
            long dealCount = dealRepository.countByOwnerIdAndIsDeletedFalse(userId);
            long accountCount = accountRepository.countByOwnerIdAndIsDeletedFalse(userId);
            long contactCount = contactRepository.countByOwnerIdAndIsDeletedFalse(userId);

            List<Activity> activities = activityRepository.findByAssignedTo(userId);
            long openActivities = activities.stream().filter(activity -> activity.getCompletedAt() == null).count();
            Instant now = Instant.now();
            long overdueActivities = activities.stream().filter(activity ->
                    activity.getCompletedAt() == null
                            && activity.getDueDate() != null
                            && activity.getDueDate().isBefore(now)
            ).count();

            sections.add(InsightSection.builder()
                    .module("CRM")
                    .title("CRM Focus")
                    .items(List.of(
                            item("crm_leads", "My Leads", leadCount, "/crm/leads", "inputs"),
                            item("crm_deals", "My Deals", dealCount, "/crm/deals", "inputs"),
                            item("crm_accounts", "My Accounts", accountCount, "/crm/accounts", "inputs"),
                            item("crm_contacts", "My Contacts", contactCount, "/crm/contacts", "inputs"),
                            item("crm_open_activities", "Open Activities", openActivities, "/crm/activities", "tasks"),
                            item("crm_overdue_activities", "Overdue Activities", overdueActivities, "/crm/activities", "tasks")
                    ))
                    .build());
        }

        if (hasAnyAuthority("ERP_VIEW", "ERP_CREATE", "ERP_EDIT", "ERP_DELETE")) {
            long salesOrders = salesOrderRepository.countByCreatedByAndIsDeletedFalse(userId);
            long purchaseOrders = purchaseOrderRepository.countByCreatedByAndIsDeletedFalse(userId);

            sections.add(InsightSection.builder()
                    .module("ERP")
                    .title("ERP Workstream")
                    .items(List.of(
                            item("erp_sales_orders", "Sales Orders Created", salesOrders, "/erp/sales-orders", "inputs"),
                            item("erp_purchase_orders", "Purchase Orders Created", purchaseOrders, "/erp/purchase-orders", "inputs")
                    ))
                    .build());
        }

        if (hasAnyAuthority("HR_VIEW", "HR_CREATE", "HR_EDIT", "HR_DELETE")) {
            long myLeaveRequests = 0L;
            long myTimesheets = 0L;
            long pendingLeaveApprovals = 0L;
            long pendingTimesheetApprovals = 0L;

            Employee employee = employeeRepository.findByUserIdAndNotDeleted(userId).orElse(null);
            if (employee != null) {
                UUID employeeId = employee.getId();
                myLeaveRequests = leaveRequestRepository.countByEmployeeIdAndIsDeletedFalse(employeeId);
                myTimesheets = timesheetRepository.countByEmployeeIdAndIsDeletedFalse(employeeId);

                List<UUID> reportIds = employeeRepository.findByManagerIdAndNotDeleted(employeeId).stream()
                        .map(Employee::getId)
                        .toList();
                if (!reportIds.isEmpty()) {
                    pendingLeaveApprovals = leaveRequestRepository.countByEmployeeIdInAndStatusAndIsDeletedFalse(
                            reportIds,
                            LeaveStatus.REQUESTED
                    );
                    pendingTimesheetApprovals = timesheetRepository.countByEmployeeIdInAndStatusAndIsDeletedFalse(
                            reportIds,
                            TimesheetStatus.SUBMITTED
                    );
                }
            }

            sections.add(InsightSection.builder()
                    .module("HR")
                    .title("HR & People")
                    .items(List.of(
                            item("hr_leave_requests", "My Leave Requests", myLeaveRequests, "/hr/leave-requests", "inputs"),
                            item("hr_timesheets", "My Timesheets", myTimesheets, "/hr/timesheets", "inputs"),
                            item("hr_pending_leave", "Pending Leave Approvals", pendingLeaveApprovals, "/hr/leave-requests", "approvals"),
                            item("hr_pending_timesheets", "Pending Timesheet Approvals", pendingTimesheetApprovals, "/hr/timesheets", "approvals")
                    ))
                    .build());
        }

        if (hasAnyAuthority("FINANCE_VIEW", "FINANCE_CREATE", "FINANCE_EDIT", "FINANCE_DELETE")) {
            long invoiceCount = invoiceRepository.countByCreatedByAndIsDeletedFalse(userId);

            sections.add(InsightSection.builder()
                    .module("FINANCE")
                    .title("Finance Pulse")
                    .items(List.of(
                            item("finance_invoices", "Invoices Created", invoiceCount, "/finance/invoices", "inputs")
                    ))
                    .build());
        }

        if (hasAnyAuthority("FIELDWORK_VIEW", "FIELDWORK_CREATE", "FIELDWORK_EDIT")) {
            long fieldJobs = fieldJobRepository.countByCreatedByAndIsDeletedFalse(userId);

            sections.add(InsightSection.builder()
                    .module("FIELDWORK")
                    .title("Fieldwork Execution")
                    .items(List.of(
                            item("fieldwork_jobs", "Field Jobs Created", fieldJobs, "/fieldwork", "inputs")
                    ))
                    .build());
        }

        if (hasAnyAuthority("REPORT_VIEW", "REPORT_EXPORT")) {
            long myReports = 0L;
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && user.getEmail() != null) {
                myReports = reportDefinitionRepository.countByOwnedByIgnoreCase(user.getEmail());
            }

            sections.add(InsightSection.builder()
                    .module("REPORTS")
                    .title("Reporting")
                    .items(List.of(
                            item("reports_saved", "Saved Reports", myReports, "/reports", "inputs")
                    ))
                    .build());
        }

        return MyInsightsResponse.builder()
                .sections(sections)
                .build();
    }

    private InsightItem item(String key, String label, long count, String href, String category) {
        return InsightItem.builder()
                .key(key)
                .label(label)
                .count(count)
                .href(href)
                .category(category)
                .build();
    }

    private boolean hasAnyAuthority(String... authorities) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }

        for (String authority : authorities) {
            for (var granted : authentication.getAuthorities()) {
                if (granted != null && authority.equals(granted.getAuthority())) {
                    return true;
                }
            }
        }

        return false;
    }
}
