package com.everx.crm.report;

import com.everx.crm.activity.Activity;
import com.everx.crm.activity.ActivityRepository;
import com.everx.crm.deal.Deal;
import com.everx.crm.deal.DealRepository;
import com.everx.crm.lead.Lead;
import com.everx.crm.lead.LeadRepository;
import com.everx.crm.contact.ContactRepository;
import com.everx.crm.account.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service("crmReportService")
@RequiredArgsConstructor
public class ReportService {

    private final LeadRepository leadRepository;
    private final ContactRepository contactRepository;
    private final AccountRepository accountRepository;
    private final DealRepository dealRepository;
    private final ActivityRepository activityRepository;

    @Transactional(readOnly = true)
    public ReportResponse.DashboardKPIs getDashboardKPIs() {
        long totalLeads = leadRepository.findAllActive(Pageable.unpaged()).getTotalElements();
        long totalContacts = contactRepository.findAllActive(Pageable.unpaged()).getTotalElements();
        long totalAccounts = accountRepository.findAllActive(Pageable.unpaged()).getTotalElements();

        List<Deal> deals = dealRepository.findAll().stream()
                .filter(d -> !Boolean.TRUE.equals(d.getIsDeleted()))
                .collect(Collectors.toList());

        long totalDeals = deals.size();
        long wonDeals = deals.stream().filter(d -> "CLOSED_WON".equals(d.getStage().name())).count();
        long lostDeals = deals.stream().filter(d -> "CLOSED_LOST".equals(d.getStage().name())).count();
        long openDeals = totalDeals - wonDeals - lostDeals;

        BigDecimal totalPipelineValue = deals.stream()
                .filter(d -> d.getAmount() != null && !"CLOSED_WON".equals(d.getStage().name()) && !"CLOSED_LOST".equals(d.getStage().name()))
                .map(Deal::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal wonValue = deals.stream()
                .filter(d -> d.getAmount() != null && "CLOSED_WON".equals(d.getStage().name()))
                .map(Deal::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long closedDeals = wonDeals + lostDeals;
        double winRate = closedDeals > 0 ? (double) wonDeals / closedDeals * 100.0 : 0.0;

        return ReportResponse.DashboardKPIs.builder()
                .totalLeads(totalLeads)
                .totalContacts(totalContacts)
                .totalAccounts(totalAccounts)
                .totalDeals(totalDeals)
                .openDeals(openDeals)
                .wonDeals(wonDeals)
                .lostDeals(lostDeals)
                .totalPipelineValue(totalPipelineValue)
                .wonValue(wonValue)
                .winRate(Math.round(winRate * 100.0) / 100.0)
                .build();
    }

    @Transactional(readOnly = true)
    public ReportResponse.PipelineReport getPipelineReport() {
        List<Deal> deals = dealRepository.findAll().stream()
                .filter(d -> !Boolean.TRUE.equals(d.getIsDeleted()))
                .collect(Collectors.toList());

        Map<String, Long> dealCountByStage = new HashMap<>();
        Map<String, BigDecimal> dealValueByStage = new HashMap<>();

        for (Deal d : deals) {
            String stage = d.getStage() != null ? d.getStage().name() : "UNKNOWN";
            dealCountByStage.merge(stage, 1L, Long::sum);
            if (d.getAmount() != null) {
                dealValueByStage.merge(stage, d.getAmount(), BigDecimal::add);
            }
        }

        BigDecimal totalPipelineValue = dealValueByStage.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ReportResponse.PipelineReport.builder()
                .dealCountByStage(dealCountByStage)
                .dealValueByStage(dealValueByStage)
                .totalPipelineValue(totalPipelineValue)
                .build();
    }

    @Transactional(readOnly = true)
    public ReportResponse.ConversionReport getConversionReport() {
        List<Lead> leads = leadRepository.findAll().stream()
                .filter(l -> !Boolean.TRUE.equals(l.getIsDeleted()))
                .collect(Collectors.toList());

        long totalLeads = leads.size();
        long converted = leads.stream().filter(l -> Boolean.TRUE.equals(l.getIsConverted())).count();
        double conversionRate = totalLeads > 0 ? (double) converted / totalLeads * 100.0 : 0.0;

        Map<String, Long> leadsByStatus = leads.stream()
                .collect(Collectors.groupingBy(
                        l -> l.getStatus() != null ? l.getStatus() : "UNKNOWN",
                        Collectors.counting()));

        Map<String, Long> leadsBySource = leads.stream()
                .filter(l -> l.getLeadSource() != null)
                .collect(Collectors.groupingBy(Lead::getLeadSource, Collectors.counting()));

        return ReportResponse.ConversionReport.builder()
                .totalLeads(totalLeads)
                .convertedLeads(converted)
                .conversionRate(Math.round(conversionRate * 100.0) / 100.0)
                .leadsByStatus(leadsByStatus)
                .leadsBySource(leadsBySource)
                .build();
    }

    @Transactional(readOnly = true)
    public ReportResponse.ActivityReport getActivityReport() {
        List<Activity> activities = activityRepository.findAll().stream()
                .filter(a -> !Boolean.TRUE.equals(a.getIsDeleted()))
                .collect(Collectors.toList());

        long total = activities.size();
        long completed = activities.stream()
                .filter(a -> a.getCompletedAt() != null || "COMPLETED".equalsIgnoreCase(a.getStatus()))
                .count();
        long overdue = activities.stream()
                .filter(a -> a.getCompletedAt() == null
                        && !"COMPLETED".equalsIgnoreCase(a.getStatus())
                        && a.getDueDate() != null
                        && a.getDueDate().isBefore(Instant.now()))
                .count();
        long pending = total - completed;

        Map<String, Long> byType = activities.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getType() != null ? a.getType() : "UNKNOWN",
                        Collectors.counting()));

        return ReportResponse.ActivityReport.builder()
                .totalActivities(total)
                .completedActivities(completed)
                .pendingActivities(pending)
                .overdueActivities(overdue)
                .activitiesByType(byType)
                .build();
    }

    @Transactional(readOnly = true)
    public ReportResponse getFullReport() {
        return ReportResponse.builder()
                .dashboard(getDashboardKPIs())
                .pipeline(getPipelineReport())
                .conversion(getConversionReport())
                .activities(getActivityReport())
                .build();
    }
}
