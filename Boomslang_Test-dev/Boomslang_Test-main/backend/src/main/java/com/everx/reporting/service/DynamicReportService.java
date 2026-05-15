package com.everx.reporting.service;

import com.everx.reporting.dto.ReportExecutionRequest;
import com.everx.reporting.dto.ReportResult;
import com.everx.reporting.entity.ReportDefinitionEntity;
import com.everx.reporting.entity.ReportRunLogEntity;
import com.everx.reporting.model.*;
import com.everx.reporting.repository.ReportDefinitionRepository;
import com.everx.reporting.repository.ReportRunLogRepository;
import com.everx.reporting.security.SqlSanitizer;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DynamicReportService {

    private final EntityManager entityManager;
    private final ReportDefinitionRepository reportDefRepo;
    private final ReportRunLogRepository runLogRepo;
    private final ReportCacheService cacheService;
    private final SqlSanitizer sqlSanitizer;
    private final ObjectMapper objectMapper;

    public ReportResult execute(Long reportId, ReportExecutionRequest request, UserDetails user) {
        long startMs = System.currentTimeMillis();

        ReportDefinitionEntity defEntity = reportDefRepo.findById(reportId)
            .orElseThrow(() -> new IllegalArgumentException("Report not found: " + reportId));

        ReportDefinition def = parseDefinition(defEntity.getDefinition());

        // Check cache
        String cacheKey = buildCacheKey(reportId, request);
        Optional<ReportResult> cached = cacheService.get(cacheKey);
        if (cached.isPresent()) {
            log.debug("Report {} served from cache", reportId);
            return cached.get();
        }

        // Build and execute query
        String sql = buildSql(def, request);
        String countSql = buildCountSql(def, request);

        log.debug("Executing report SQL: {}", sql);

        Query query = entityManager.createNativeQuery(sql);
        Query countQuery = entityManager.createNativeQuery(countSql);

        applyParameters(query, def, request);
        applyParameters(countQuery, def, request);

        if (request.getPage() != null) {
            query.setFirstResult(request.getPage() * request.getPageSize());
            query.setMaxResults(request.getPageSize());
        }

        @SuppressWarnings("unchecked")
        List<Object[]> rawRows = query.getResultList();
        Long totalCount = ((Number) countQuery.getSingleResult()).longValue();

        // Transform to typed result
        List<Map<String, Object>> rows = transformRows(rawRows, def.getColumns());
        Map<String, Object> aggregates = computeAggregates(rows, def.getColumns());

        ReportResult result = ReportResult.builder()
            .reportId(reportId)
            .reportName(defEntity.getReportName())
            .columns(def.getColumns().stream().filter(ReportColumn::isVisible).collect(Collectors.toList()))
            .rows(rows)
            .totalCount(totalCount)
            .page(request.getPage() != null ? request.getPage() : 0)
            .pageSize(request.getPageSize() != null ? request.getPageSize() : 20)
            .aggregates(aggregates)
            .chartData(Collections.emptyList())
            .executedAt(LocalDateTime.now())
            .durationMs(System.currentTimeMillis() - startMs)
            .build();

        cacheService.put(cacheKey, result, getCacheTtl(def.getModule()));

        logRun(reportId, user, request, result);

        defEntity.setLastRunAt(LocalDateTime.now());
        defEntity.setRunCount(defEntity.getRunCount() + 1);
        reportDefRepo.save(defEntity);

        return result;
    }

    private String buildSql(ReportDefinition def, ReportExecutionRequest request) {
        StringBuilder sql = new StringBuilder();

        // SELECT clause
        sql.append("SELECT ");
        List<String> selectClauses = def.getColumns().stream()
            .filter(ReportColumn::isVisible)
            .map(col -> {
                String field = sqlSanitizer.sanitizeColumnRef(col.getField());
                if (col.getAggregation() != null && !col.getAggregation().isEmpty()) {
                    return col.getAggregation() + "(" + field + ") AS " +
                           sqlSanitizer.sanitizeAlias(col.getColumnId());
                }
                return field + " AS " + sqlSanitizer.sanitizeAlias(col.getColumnId());
            })
            .collect(Collectors.toList());
        sql.append(String.join(", ", selectClauses));

        // FROM clause
        sql.append(" FROM ").append(sqlSanitizer.sanitizeTableRef(def.getPrimaryTable()));

        // JOIN clauses
        if (def.getJoins() != null && !def.getJoins().isEmpty()) {
            def.getJoins().forEach(join -> sql.append(" ").append(join));
        }

        // WHERE clause
        List<String> conditions = buildWhereConditions(def, request);
        if (!conditions.isEmpty()) {
            sql.append(" WHERE ").append(String.join(" AND ", conditions));
        }

        // ORDER BY
        List<SortConfig> sorts = request.getSorts() != null && !request.getSorts().isEmpty()
            ? request.getSorts() : def.getSorts();
        if (sorts != null && !sorts.isEmpty()) {
            sql.append(" ORDER BY ");
            sql.append(sorts.stream()
                .map(s -> sqlSanitizer.sanitizeColumnRef(s.getField()) +
                          " " + ("DESC".equals(s.getDirection()) ? "DESC" : "ASC"))
                .collect(Collectors.joining(", ")));
        }

        return sql.toString();
    }

    private String buildCountSql(ReportDefinition def, ReportExecutionRequest request) {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM ");
        sql.append(sqlSanitizer.sanitizeTableRef(def.getPrimaryTable()));

        if (def.getJoins() != null && !def.getJoins().isEmpty()) {
            def.getJoins().forEach(join -> sql.append(" ").append(join));
        }

        List<String> conditions = buildWhereConditions(def, request);
        if (!conditions.isEmpty()) {
            sql.append(" WHERE ").append(String.join(" AND ", conditions));
        }

        return sql.toString();
    }

    private List<String> buildWhereConditions(ReportDefinition def, ReportExecutionRequest request) {
        List<String> conditions = new ArrayList<>();

        // Apply request-level user filters
        if (request.getFilters() != null) {
            request.getFilters().stream()
                .filter(f -> f.getValue() != null)
                .map(this::filterToSql)
                .forEach(conditions::add);
        }

        // Apply date range
        if (request.getDateFrom() != null && def.getDateRangeField() != null) {
            conditions.add(def.getDateRangeField() + " >= :dateFrom");
        }
        if (request.getDateTo() != null && def.getDateRangeField() != null) {
            conditions.add(def.getDateRangeField() + " <= :dateTo");
        }

        // Apply entity filter
        if (request.getCompanyCode() != null && def.getEntityField() != null) {
            conditions.add(def.getEntityField() + " = :companyCode");
        }

        return conditions;
    }

    private String filterToSql(ReportFilter filter) {
        String field = sqlSanitizer.sanitizeColumnRef(filter.getField());
        return switch (filter.getOperator()) {
            case "EQ" -> field + " = :" + filter.getFilterId();
            case "NEQ" -> field + " != :" + filter.getFilterId();
            case "GT" -> field + " > :" + filter.getFilterId();
            case "GTE" -> field + " >= :" + filter.getFilterId();
            case "LT" -> field + " < :" + filter.getFilterId();
            case "LTE" -> field + " <= :" + filter.getFilterId();
            case "IN" -> field + " = ANY(:" + filter.getFilterId() + ")";
            case "CONTAINS" -> "LOWER(" + field + ") LIKE LOWER(CONCAT('%',:'" + filter.getFilterId() + "'," + "'%'))";
            case "BETWEEN" -> field + " BETWEEN :" + filter.getFilterId() + " AND :" + filter.getFilterId() + "_to";
            case "IS_NULL" -> field + " IS NULL";
            case "NOT_NULL" -> field + " IS NOT NULL";
            default -> throw new IllegalArgumentException("Unknown operator: " + filter.getOperator());
        };
    }

    private void applyParameters(Query query, ReportDefinition def, ReportExecutionRequest request) {
        if (request.getFilters() != null) {
            for (ReportFilter filter : request.getFilters()) {
                if (filter.getValue() != null) {
                    if ("BETWEEN".equals(filter.getOperator())) {
                        query.setParameter(filter.getFilterId(), filter.getValue());
                        query.setParameter(filter.getFilterId() + "_to", filter.getValueTo());
                    } else if ("IN".equals(filter.getOperator())) {
                        query.setParameter(filter.getFilterId(), filter.getValue());
                    } else {
                        query.setParameter(filter.getFilterId(), filter.getValue());
                    }
                }
            }
        }

        if (request.getDateFrom() != null && def.getDateRangeField() != null) {
            query.setParameter("dateFrom", request.getDateFrom());
        }
        if (request.getDateTo() != null && def.getDateRangeField() != null) {
            query.setParameter("dateTo", request.getDateTo());
        }
        if (request.getCompanyCode() != null && def.getEntityField() != null) {
            query.setParameter("companyCode", request.getCompanyCode());
        }
    }

    private List<Map<String, Object>> transformRows(List<Object[]> rawRows, List<ReportColumn> columns) {
        List<Map<String, Object>> result = new ArrayList<>();
        List<ReportColumn> visibleColumns = columns.stream()
            .filter(ReportColumn::isVisible)
            .collect(Collectors.toList());

        for (Object[] row : rawRows) {
            Map<String, Object> rowMap = new LinkedHashMap<>();
            for (int i = 0; i < visibleColumns.size(); i++) {
                ReportColumn col = visibleColumns.get(i);
                rowMap.put(col.getColumnId(), row[i]);
            }
            result.add(rowMap);
        }
        return result;
    }

    private Map<String, Object> computeAggregates(List<Map<String, Object>> rows, List<ReportColumn> columns) {
        Map<String, Object> aggregates = new LinkedHashMap<>();

        for (ReportColumn col : columns) {
            if (col.isAggregatable() && col.getAggregation() != null) {
                switch (col.getAggregation()) {
                    case "SUM" -> aggregates.put(col.getColumnId(), 
                        rows.stream()
                            .map(r -> r.get(col.getColumnId()))
                            .filter(Objects::nonNull)
                            .map(v -> new BigDecimal(v.toString()))
                            .reduce(BigDecimal.ZERO, BigDecimal::add));
                    case "COUNT" -> aggregates.put(col.getColumnId(), (long) rows.size());
                    case "AVG" -> aggregates.put(col.getColumnId(),
                        rows.stream()
                            .map(r -> r.get(col.getColumnId()))
                            .filter(Objects::nonNull)
                            .map(v -> new BigDecimal(v.toString()))
                            .collect(Collectors.averagingDouble(BigDecimal::doubleValue)));
                    case "MIN" -> {
                        Optional<?> min = rows.stream()
                            .map(r -> r.get(col.getColumnId()))
                            .filter(Objects::nonNull)
                            .min((o1, o2) -> {
                                if (o1 instanceof Comparable && o2 instanceof Comparable) {
                                    return ((Comparable<Object>) o1).compareTo(o2);
                                }
                                return 0;
                            });
                        aggregates.put(col.getColumnId(), min.orElse(null));
                    }
                    case "MAX" -> {
                        Optional<?> max = rows.stream()
                            .map(r -> r.get(col.getColumnId()))
                            .filter(Objects::nonNull)
                            .max((o1, o2) -> {
                                if (o1 instanceof Comparable && o2 instanceof Comparable) {
                                    return ((Comparable<Object>) o1).compareTo(o2);
                                }
                                return 0;
                            });
                        aggregates.put(col.getColumnId(), max.orElse(null));
                    }
                }
            }
        }

        return aggregates;
    }

    private ReportDefinition parseDefinition(Object definitionJson) {
        return objectMapper.convertValue(definitionJson, ReportDefinition.class);
    }

    private String buildCacheKey(Long reportId, ReportExecutionRequest request) {
        return "report:" + reportId + ":" + (request.getPage() != null ? request.getPage() : 0);
    }

    private void logRun(Long reportId, UserDetails user, ReportExecutionRequest request, ReportResult result) {
        try {
            ReportRunLogEntity log = ReportRunLogEntity.builder()
                .reportId(reportId)
                .runBy(user != null ? user.getUsername() : "SYSTEM")
                .runAt(LocalDateTime.now())
                .rowCount(Math.toIntExact(result.getTotalCount()))
                .durationMs(Math.toIntExact(result.getDurationMs()))
                .status("SUCCESS")
                .build();
            runLogRepo.save(log);
        } catch (Exception e) {
            log.warn("Failed to log report run: {}", e.getMessage());
        }
    }

    private java.time.Duration getCacheTtl(String module) {
        return switch (module) {
            case "CRM" -> java.time.Duration.ofMinutes(5);
            case "ERP" -> java.time.Duration.ofMinutes(10);
            case "FINANCE" -> java.time.Duration.ofMinutes(15);
            case "CROSS" -> java.time.Duration.ofMinutes(10);
            default -> java.time.Duration.ofMinutes(5);
        };
    }
}
