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
import com.everx.shared.service.DataScopeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
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
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service("crmReportService")
@RequiredArgsConstructor
public class ReportService {
        private enum ForcedScope {
                AUTO,
                SELF,
                TEAM
        }

    private final LeadRepository leadRepository;
    private final ContactRepository contactRepository;
    private final AccountRepository accountRepository;
    private final DealRepository dealRepository;
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
        private final DataScopeService dataScopeService;

    @Transactional(readOnly = true)
    public ReportResponse.DashboardKPIs getDashboardKPIs() {
        return getDashboardKPIs(resolveScope());
    }

        @Transactional(readOnly = true)
        public ReportResponse.DashboardKPIs getDashboardKPIsForSelf() {
                return getDashboardKPIs(resolveScope(ForcedScope.SELF));
        }

        @Transactional(readOnly = true)
        public ReportResponse.DashboardKPIs getDashboardKPIsForTeam() {
                return getDashboardKPIs(resolveScope(ForcedScope.TEAM));
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

        @Transactional(readOnly = true)
        public ReportResponse.PipelineReport getPipelineReportForSelf() {
                return getPipelineReport(resolveScope(ForcedScope.SELF));
        }

        @Transactional(readOnly = true)
        public ReportResponse.PipelineReport getPipelineReportForTeam() {
                return getPipelineReport(resolveScope(ForcedScope.TEAM));
        }

        private ReportResponse.PipelineReport getPipelineReport(ReportScope scope) {
                List<Deal> scopedDeals = getScopedDeals(scope);

                Map<String, Long> dealCountByStage = new LinkedHashMap<>();
                Map<String, BigDecimal> dealValueByStage = new LinkedHashMap<>();

                for (Deal d : scopedDeals) {
                        if (!isOpenDeal(d)) {
                                continue;
                        }

            String stage = d.getStage() != null ? d.getStage() : "UNKNOWN";
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

        @Transactional(readOnly = true)
        public ReportResponse.ConversionReport getConversionReportForSelf() {
                return getConversionReport(resolveScope(ForcedScope.SELF));
        }

        @Transactional(readOnly = true)
        public ReportResponse.ConversionReport getConversionReportForTeam() {
                return getConversionReport(resolveScope(ForcedScope.TEAM));
        }

    private ReportResponse.ConversionReport getConversionReport(ReportScope scope) {
        List<Lead> scopedLeads = getScopedLeads(scope);

        long totalLeads = scopedLeads.size();
        long converted = scopedLeads.stream().filter(this::isConvertedLead).count();
        double conversionRate = totalLeads > 0
                ? roundPercentage((double) converted / totalLeads * 100.0)
                : 0.0;

        Map<String, Long> leadsByStatus = scopedLeads.stream()
                .collect(Collectors.groupingBy(
                        l -> normalizeBucketKey(l.getStatus()),
                        Collectors.counting()));

        Map<String, Long> leadsBySource = scopedLeads.stream()
                .collect(Collectors.groupingBy(
                        l -> normalizeBucketKey(l.getLeadSource()),
                        Collectors.counting()));

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

        @Transactional(readOnly = true)
        public ReportResponse.ActivityReport getActivityReportForSelf() {
                return getActivityReport(resolveScope(ForcedScope.SELF));
        }

        @Transactional(readOnly = true)
        public ReportResponse.ActivityReport getActivityReportForTeam() {
                return getActivityReport(resolveScope(ForcedScope.TEAM));
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
        long pending = scopedActivities.stream()
                .filter(a -> !isCompletedActivity(a))
                .filter(a -> a.getDueDate() == null || !a.getDueDate().isBefore(now))
                .count();

        Map<String, Long> byType = scopedActivities.stream()
                .collect(Collectors.groupingBy(
                        a -> normalizeBucketKey(a.getType()),
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
                return resolveScope(ForcedScope.AUTO);
        }

        private ReportScope resolveScope(ForcedScope forcedScope) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication == null || !authentication.isAuthenticated()) {
                        return new ReportScope(false, null);
                }

                UUID viewerUserId = extractViewerUserId(authentication);

                DataScopeService.DataScope forcedDataScope = null;
                if (forcedScope == ForcedScope.SELF) {
                        forcedDataScope = DataScopeService.DataScope.OWN;
                } else if (forcedScope == ForcedScope.TEAM) {
                        forcedDataScope = DataScopeService.DataScope.TEAM;
                }

                DataScopeService.DataScope resolvedScope = dataScopeService.resolveScope(authentication, forcedDataScope);
                boolean teamScope = resolvedScope == DataScopeService.DataScope.TEAM
                                || resolvedScope == DataScopeService.DataScope.ORG;

                return new ReportScope(teamScope, viewerUserId);
        }

        private UUID extractViewerUserId(Authentication authentication) {
                Object principal = authentication.getPrincipal();
                if (principal instanceof UUID principalUuid) {
                        return principalUuid;
                }

                if (principal instanceof String principalString) {
                        UUID parsed = tryParseUuid(principalString);
                        if (parsed != null) {
                                return parsed;
                        }
                }

                return tryParseUuid(authentication.getName());
        }

        private UUID tryParseUuid(String value) {
                if (value == null || value.isBlank()) {
                        return null;
                }

                try {
                        return UUID.fromString(value);
                } catch (IllegalArgumentException ignored) {
                        return null;
                }
        }

        private List<Lead> getScopedLeads(ReportScope scope) {
                List<Lead> leads = leadRepository.findAllActive(Pageable.unpaged()).getContent();

                if (scope.teamScope) {
                        return leads;
                }

                if (scope.viewerUserId == null) {
                        return List.of();
                }

                return leads.stream()
                                .filter(lead -> isOwnedByViewer(lead.getOwnerId(), lead.getCreatedBy(), scope.viewerUserId))
                                .toList();
        }

        private List<Deal> getScopedDeals(ReportScope scope) {
                List<Deal> deals = dealRepository.findAllActive(Pageable.unpaged()).getContent();

                if (scope.teamScope) {
                        return deals;
                }

                if (scope.viewerUserId == null) {
                        return List.of();
                }

                return deals.stream()
                                .filter(deal -> isOwnedByViewer(deal.getOwnerId(), deal.getCreatedBy(), scope.viewerUserId))
                                .toList();
        }

        private List<Activity> getScopedActivities(ReportScope scope) {
                List<Activity> activities = activityRepository.findAllNotDeleted(Pageable.unpaged()).getContent();

                if (scope.teamScope) {
                        return activities;
                }

                if (scope.viewerUserId == null) {
                        return List.of();
                }

                return activities.stream()
                                .filter(activity -> isOwnedByViewer(activity.getAssignedTo(), activity.getCreatedBy(), scope.viewerUserId))
                                .toList();
        }

        private long getScopedContactsCount(ReportScope scope) {
                if (scope.teamScope) {
                        return contactRepository.findAllActive(Pageable.unpaged()).getTotalElements();
                }

                if (scope.viewerUserId == null) {
                        return 0L;
                }

                List<Contact> contacts = contactRepository.findAllActive(Pageable.unpaged()).getContent();
                return contacts.stream()
                                .filter(contact -> isOwnedByViewer(contact.getOwnerId(), contact.getCreatedBy(), scope.viewerUserId))
                                .count();
        }

        private long getScopedAccountsCount(ReportScope scope) {
                if (scope.teamScope) {
                        return accountRepository.findAllActive(Pageable.unpaged()).getTotalElements();
                }

                if (scope.viewerUserId == null) {
                        return 0L;
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
                return deal.getStage() != null && "CLOSED_WON".equals(deal.getStage());
        }

        private boolean isLostDeal(Deal deal) {
                return deal.getStage() != null && "CLOSED_LOST".equals(deal.getStage());
        }

        private boolean isOpenDeal(Deal deal) {
                return !isWonDeal(deal) && !isLostDeal(deal);
        }

        private boolean isCompletedActivity(Activity activity) {
                return activity.getCompletedAt() != null || "COMPLETED".equalsIgnoreCase(activity.getStatus());
        }

        private boolean isConvertedLead(Lead lead) {
                return Boolean.TRUE.equals(lead.getIsConverted())
                                || "CONVERTED".equalsIgnoreCase(lead.getStatus());
        }

        private String normalizeBucketKey(String value) {
                if (value == null) {
                        return "UNKNOWN";
                }

                String normalized = value.trim();
                if (normalized.isEmpty()) {
                        return "UNKNOWN";
                }

                return normalized.toUpperCase(Locale.ROOT);
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
                        if (isConvertedLead(lead)) {
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
