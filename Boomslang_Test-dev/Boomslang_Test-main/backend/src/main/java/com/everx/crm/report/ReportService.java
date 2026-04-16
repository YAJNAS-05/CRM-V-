package com.everx.crm.report;

import com.everx.auth.entity.User;
import com.everx.auth.repository.UserRepository;
import com.everx.crm.account.Account;
import com.everx.crm.activity.Activity;
import com.everx.crm.activity.ActivityRepository;
import com.everx.crm.account.AccountRepository;
import com.everx.crm.contact.Contact;
import com.everx.crm.deal.Deal;
import com.everx.crm.deal.DealRepository;
import com.everx.crm.contact.ContactRepository;
import com.everx.crm.lead.Lead;
import com.everx.crm.lead.LeadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service("crmReportService")
@RequiredArgsConstructor
public class ReportService {

    private static final Set<String> TEAM_SCOPE_ROLES = Set.of("SUPER_ADMIN", "ADMIN", "SALES_MANAGER", "MANAGER");
        private static final String TEAM_SCOPE_ROLE_KEYWORD = "MANAGER";
        private static final Set<String> TEAM_SCOPE_PERMISSIONS = Set.of("REPORT_VIEW", "REPORT_EXPORT");

    private final LeadRepository leadRepository;
    private final ContactRepository contactRepository;
    private final AccountRepository accountRepository;
    private final DealRepository dealRepository;
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public ReportResponse.DashboardKPIs getDashboardKPIs() {
        return getDashboardKPIs(resolveScope());
    }

    private ReportResponse.DashboardKPIs getDashboardKPIs(ReportScope scope) {
        List<Lead> scopedLeads = getScopedLeads(scope);
        List<Deal> scopedDeals = getScopedDeals(scope);
        List<Activity> scopedActivities = getScopedActivities(scope);

        long totalLeads = scopedLeads.size();
        long totalContacts = getScopedContactsCount(scope);
        long totalAccounts = getScopedAccountsCount(scope);

        long totalDeals = scopedDeals.size();
        long wonDeals = scopedDeals.stream().filter(this::isWonDeal).count();
        long lostDeals = scopedDeals.stream().filter(this::isLostDeal).count();
        long openDeals = totalDeals - wonDeals - lostDeals;

        BigDecimal totalPipelineValue = scopedDeals.stream()
                .filter(d -> d.getAmount() != null && isOpenDeal(d))
                .map(Deal::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal wonValue = scopedDeals.stream()
                .filter(d -> d.getAmount() != null && isWonDeal(d))
                .map(Deal::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long closedDeals = wonDeals + lostDeals;
        double winRate = closedDeals > 0 ? roundPercentage((double) wonDeals / closedDeals * 100.0) : 0.0;

        List<ReportResponse.UserPerformance> userPerformance = scope.teamScope
                ? buildUserPerformance(scopedLeads, scopedDeals, scopedActivities)
                : List.of();

        int teamMemberCount = (int) userPerformance.stream()
                .filter(row -> row.getUserId() != null)
                .count();

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
                                .winRate(winRate)
                                .visibilityScope(scope.teamScope ? "TEAM" : "SELF")
                                .viewerUserId(scope.viewerUserId)
                                .teamMemberCount(teamMemberCount)
                                .userPerformance(userPerformance)
                .build();
    }

    @Transactional(readOnly = true)
    public ReportResponse.PipelineReport getPipelineReport() {
                return getPipelineReport(resolveScope());
        }

        private ReportResponse.PipelineReport getPipelineReport(ReportScope scope) {
                List<Deal> scopedDeals = getScopedDeals(scope);

                Map<String, Long> dealCountByStage = new LinkedHashMap<>();
                Map<String, BigDecimal> dealValueByStage = new LinkedHashMap<>();

                for (Deal d : scopedDeals) {
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
        return getConversionReport(resolveScope());
    }

    private ReportResponse.ConversionReport getConversionReport(ReportScope scope) {
        List<Lead> scopedLeads = getScopedLeads(scope);

        long totalLeads = scopedLeads.size();
        long converted = scopedLeads.stream().filter(l -> Boolean.TRUE.equals(l.getIsConverted())).count();
        double conversionRate = totalLeads > 0
                ? roundPercentage((double) converted / totalLeads * 100.0)
                : 0.0;

        Map<String, Long> leadsByStatus = scopedLeads.stream()
                .collect(Collectors.groupingBy(
                        l -> l.getStatus() != null ? l.getStatus() : "UNKNOWN",
                        Collectors.counting()));

        Map<String, Long> leadsBySource = scopedLeads.stream()
                .filter(l -> l.getLeadSource() != null)
                .collect(Collectors.groupingBy(Lead::getLeadSource, Collectors.counting()));

        return ReportResponse.ConversionReport.builder()
                .totalLeads(totalLeads)
                .convertedLeads(converted)
                .conversionRate(conversionRate)
                .leadsByStatus(leadsByStatus)
                .leadsBySource(leadsBySource)
                .build();
    }

    @Transactional(readOnly = true)
    public ReportResponse.ActivityReport getActivityReport() {
        return getActivityReport(resolveScope());
    }

    private ReportResponse.ActivityReport getActivityReport(ReportScope scope) {
        List<Activity> scopedActivities = getScopedActivities(scope);
        Instant now = Instant.now();

        long total = scopedActivities.size();
        long completed = scopedActivities.stream()
                .filter(this::isCompletedActivity)
                .count();
        long overdue = scopedActivities.stream()
                .filter(a -> !isCompletedActivity(a)
                        && a.getDueDate() != null
                        && a.getDueDate().isBefore(now))
                .count();
        long pending = total - completed;

        Map<String, Long> byType = scopedActivities.stream()
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
                ReportScope scope = resolveScope();
        return ReportResponse.builder()
                                .dashboard(getDashboardKPIs(scope))
                                .pipeline(getPipelineReport(scope))
                                .conversion(getConversionReport(scope))
                                .activities(getActivityReport(scope))
                .build();
    }

        private ReportScope resolveScope() {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication == null || !authentication.isAuthenticated()) {
                        return new ReportScope(true, null);
                }

                UUID viewerUserId = authentication.getPrincipal() instanceof UUID
                                ? (UUID) authentication.getPrincipal()
                                : null;

                Set<String> roleNames = authentication.getAuthorities().stream()
                                .map(GrantedAuthority::getAuthority)
                                .filter(authority -> authority != null && authority.startsWith("ROLE_"))
                                .map(authority -> authority.substring(5))
                                .map(String::toUpperCase)
                                .collect(Collectors.toSet());

                Set<String> permissionNames = authentication.getAuthorities().stream()
                                .map(GrantedAuthority::getAuthority)
                                .filter(authority -> authority != null && !authority.startsWith("ROLE_"))
                                .map(String::toUpperCase)
                                .collect(Collectors.toSet());

                boolean teamScope = roleNames.stream().anyMatch(roleName ->
                                TEAM_SCOPE_ROLES.contains(roleName)
                                                || roleName.contains(TEAM_SCOPE_ROLE_KEYWORD))
                                || permissionNames.stream().anyMatch(TEAM_SCOPE_PERMISSIONS::contains);
                return new ReportScope(teamScope, viewerUserId);
        }

        private List<Lead> getScopedLeads(ReportScope scope) {
                List<Lead> leads = leadRepository.findAll().stream()
                                .filter(lead -> !Boolean.TRUE.equals(lead.getIsDeleted()))
                                .toList();

                if (scope.teamScope || scope.viewerUserId == null) {
                        return leads;
                }

                return leads.stream()
                                .filter(lead -> isOwnedByViewer(lead.getOwnerId(), lead.getCreatedBy(), scope.viewerUserId))
                                .toList();
        }

        private List<Deal> getScopedDeals(ReportScope scope) {
                List<Deal> deals = dealRepository.findAll().stream()
                                .filter(deal -> !Boolean.TRUE.equals(deal.getIsDeleted()))
                                .toList();

                if (scope.teamScope || scope.viewerUserId == null) {
                        return deals;
                }

                return deals.stream()
                                .filter(deal -> isOwnedByViewer(deal.getOwnerId(), deal.getCreatedBy(), scope.viewerUserId))
                                .toList();
        }

        private List<Activity> getScopedActivities(ReportScope scope) {
                List<Activity> activities = activityRepository.findAll().stream()
                                .filter(activity -> !Boolean.TRUE.equals(activity.getIsDeleted()))
                                .toList();

                if (scope.teamScope || scope.viewerUserId == null) {
                        return activities;
                }

                return activities.stream()
                                .filter(activity -> isOwnedByViewer(activity.getAssignedTo(), activity.getCreatedBy(), scope.viewerUserId))
                                .toList();
        }

        private long getScopedContactsCount(ReportScope scope) {
                if (scope.teamScope || scope.viewerUserId == null) {
                        return contactRepository.findAllActive(Pageable.unpaged()).getTotalElements();
                }

                List<Contact> contacts = contactRepository.findAllActive(Pageable.unpaged()).getContent();
                return contacts.stream()
                                .filter(contact -> isOwnedByViewer(contact.getOwnerId(), contact.getCreatedBy(), scope.viewerUserId))
                                .count();
        }

        private long getScopedAccountsCount(ReportScope scope) {
                if (scope.teamScope || scope.viewerUserId == null) {
                        return accountRepository.findAllActive(Pageable.unpaged()).getTotalElements();
                }

                List<Account> accounts = accountRepository.findAllActive(Pageable.unpaged()).getContent();
                return accounts.stream()
                                .filter(account -> isOwnedByViewer(account.getOwnerId(), account.getCreatedBy(), scope.viewerUserId))
                                .count();
        }

        private boolean isOwnedByViewer(UUID explicitOwnerId, UUID createdBy, UUID viewerUserId) {
                UUID effectiveOwner = explicitOwnerId != null ? explicitOwnerId : createdBy;
                return viewerUserId != null && viewerUserId.equals(effectiveOwner);
        }

        private UUID resolveLeadOwnerId(Lead lead) {
                return lead.getOwnerId() != null ? lead.getOwnerId() : lead.getCreatedBy();
        }

        private UUID resolveDealOwnerId(Deal deal) {
                return deal.getOwnerId() != null ? deal.getOwnerId() : deal.getCreatedBy();
        }

        private UUID resolveActivityOwnerId(Activity activity) {
                return activity.getAssignedTo() != null ? activity.getAssignedTo() : activity.getCreatedBy();
        }

        private boolean isWonDeal(Deal deal) {
                return deal.getStage() != null && "CLOSED_WON".equals(deal.getStage().name());
        }

        private boolean isLostDeal(Deal deal) {
                return deal.getStage() != null && "CLOSED_LOST".equals(deal.getStage().name());
        }

        private boolean isOpenDeal(Deal deal) {
                return !isWonDeal(deal) && !isLostDeal(deal);
        }

        private boolean isCompletedActivity(Activity activity) {
                return activity.getCompletedAt() != null || "COMPLETED".equalsIgnoreCase(activity.getStatus());
        }

        private List<ReportResponse.UserPerformance> buildUserPerformance(
                        List<Lead> leads,
                        List<Deal> deals,
                        List<Activity> activities
        ) {
                Map<UUID, UserPerformanceAccumulator> metricsByUser = new LinkedHashMap<>();

                for (Lead lead : leads) {
                        UUID userId = resolveLeadOwnerId(lead);
                        UserPerformanceAccumulator accumulator = metricsByUser.computeIfAbsent(userId, key -> new UserPerformanceAccumulator());
                        accumulator.leads++;
                        if (Boolean.TRUE.equals(lead.getIsConverted())) {
                                accumulator.convertedLeads++;
                        }
                }

                for (Deal deal : deals) {
                        UUID userId = resolveDealOwnerId(deal);
                        UserPerformanceAccumulator accumulator = metricsByUser.computeIfAbsent(userId, key -> new UserPerformanceAccumulator());
                        accumulator.deals++;

                        if (isWonDeal(deal)) {
                                accumulator.wonDeals++;
                        } else if (isLostDeal(deal)) {
                                accumulator.lostDeals++;
                        } else {
                                accumulator.openDeals++;
                                if (deal.getAmount() != null) {
                                        accumulator.pipelineValue = accumulator.pipelineValue.add(deal.getAmount());
                                }
                        }
                }

                Instant now = Instant.now();
                for (Activity activity : activities) {
                        UUID userId = resolveActivityOwnerId(activity);
                        UserPerformanceAccumulator accumulator = metricsByUser.computeIfAbsent(userId, key -> new UserPerformanceAccumulator());
                        accumulator.activities++;

                        if (isCompletedActivity(activity)) {
                                accumulator.completedActivities++;
                        } else if (activity.getDueDate() != null && activity.getDueDate().isBefore(now)) {
                                accumulator.overdueActivities++;
                        }
                }

                Set<UUID> userIds = metricsByUser.keySet().stream()
                                .filter(java.util.Objects::nonNull)
                                .collect(Collectors.toCollection(HashSet::new));

                Map<UUID, User> usersById = userRepository.findAllById(userIds).stream()
                                .collect(Collectors.toMap(User::getId, Function.identity()));

                return metricsByUser.entrySet().stream()
                                .map(entry -> {
                                        UUID userId = entry.getKey();
                                        UserPerformanceAccumulator accumulator = entry.getValue();
                                        double conversionRate = accumulator.leads > 0
                                                        ? roundPercentage((double) accumulator.convertedLeads / accumulator.leads * 100.0)
                                                        : 0.0;

                                        return ReportResponse.UserPerformance.builder()
                                                        .userId(userId)
                                                        .userName(resolveUserName(userId, usersById))
                                                        .leads(accumulator.leads)
                                                        .convertedLeads(accumulator.convertedLeads)
                                                        .deals(accumulator.deals)
                                                        .openDeals(accumulator.openDeals)
                                                        .wonDeals(accumulator.wonDeals)
                                                        .lostDeals(accumulator.lostDeals)
                                                        .pipelineValue(accumulator.pipelineValue)
                                                        .activities(accumulator.activities)
                                                        .completedActivities(accumulator.completedActivities)
                                                        .overdueActivities(accumulator.overdueActivities)
                                                        .leadConversionRate(conversionRate)
                                                        .build();
                                })
                                .sorted(Comparator
                                                .comparing(ReportResponse.UserPerformance::getPipelineValue, Comparator.nullsFirst(BigDecimal::compareTo))
                                                .reversed()
                                                .thenComparing(ReportResponse.UserPerformance::getDeals, Comparator.reverseOrder())
                                                .thenComparing(ReportResponse.UserPerformance::getLeads, Comparator.reverseOrder())
                                                .thenComparing(ReportResponse.UserPerformance::getUserName, String.CASE_INSENSITIVE_ORDER)
                                )
                                .toList();
        }

        private String resolveUserName(UUID userId, Map<UUID, User> usersById) {
                if (userId == null) {
                        return "Unassigned";
                }

                User user = usersById.get(userId);
                if (user == null) {
                        return "User " + userId.toString().substring(0, 8);
                }

                if (user.getFullName() != null && !user.getFullName().isBlank()) {
                        return user.getFullName();
                }

                if (user.getEmail() != null && !user.getEmail().isBlank()) {
                        return user.getEmail();
                }

                return "User " + userId.toString().substring(0, 8);
        }

        private double roundPercentage(double value) {
                return BigDecimal.valueOf(value)
                                .setScale(2, RoundingMode.HALF_UP)
                                .doubleValue();
        }

        private static final class ReportScope {
                private final boolean teamScope;
                private final UUID viewerUserId;

                private ReportScope(boolean teamScope, UUID viewerUserId) {
                        this.teamScope = teamScope;
                        this.viewerUserId = viewerUserId;
                }
        }

        private static final class UserPerformanceAccumulator {
                private long leads;
                private long convertedLeads;
                private long deals;
                private long openDeals;
                private long wonDeals;
                private long lostDeals;
                private BigDecimal pipelineValue = BigDecimal.ZERO;
                private long activities;
                private long completedActivities;
                private long overdueActivities;
        }
}
