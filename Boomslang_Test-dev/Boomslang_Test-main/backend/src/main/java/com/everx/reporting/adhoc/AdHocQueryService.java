package com.everx.reporting.adhoc;

import com.everx.reporting.adhoc.dto.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdHocQueryService {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;
    private final SavedQueryRepository savedQueryRepository;

    // Whitelisted tables for security
    private static final List<String> ALLOWED_TABLES = List.of(
        "crm_accounts", "crm_contacts", "crm_leads", "crm_deals", "crm_quotes",
        "erp_equipment", "erp_purchase_orders", "erp_field_jobs", "erp_inventory",
        "hr_employees", "hr_departments", "hr_leave_requests", "hr_payroll_runs",
        "finance_invoices", "finance_payments", "finance_gl_journal_entries"
    );

    // Whitelisted columns for each table (subset for security)
    private static final Map<String, List<String>> ALLOWED_COLUMNS = Map.of(
        "crm_accounts", List.of("id", "name", "industry", "account_type", "annual_revenue", "employees", "created_at"),
        "crm_deals", List.of("id", "name", "stage", "amount", "probability", "expected_close_date", "account_id", "owner_id"),
        "hr_employees", List.of("id", "first_name", "last_name", "email", "department_id", "position", "status", "hire_date"),
        "finance_invoices", List.of("id", "invoice_number", "account_id", "total_amount", "status", "issue_date", "due_date")
    );

    @Transactional(readOnly = true)
    public AdHocQueryResult executeQuery(AdHocQueryRequest request, Pageable pageable) {
        log.info("Executing ad-hoc query: {}", request.getQueryName());

        // Validate query
        validateQuery(request);

        // Build SQL
        String sql = buildSqlQuery(request);
        
        // Add pagination
        String countSql = "SELECT COUNT(*) FROM (" + sql + ") AS count_query";
        int total = jdbcTemplate.queryForObject(countSql, Integer.class);

        String paginatedSql = sql + " LIMIT " + pageable.getPageSize() + 
                               " OFFSET " + pageable.getOffset();

        // Execute query
        List<Map<String, Object>> results = jdbcTemplate.query(paginatedSql, new RowMapper<Map<String, Object>>() {
            @Override
            public Map<String, Object> mapRow(ResultSet rs, int rowNum) throws SQLException {
                Map<String, Object> row = new LinkedHashMap<>();
                ResultSetMetaData metaData = rs.getMetaData();
                int columnCount = metaData.getColumnCount();
                
                for (int i = 1; i <= columnCount; i++) {
                    String columnName = metaData.getColumnLabel(i);
                    Object value = rs.getObject(i);
                    row.put(columnName, convertValue(value));
                }
                return row;
            }
        });

        // Get column metadata
        List<QueryColumnMetadata> columns = getColumnMetadata(results);

        return AdHocQueryResult.builder()
            .queryName(request.getQueryName())
            .columns(columns)
            .rows(results)
            .totalCount(total)
            .page(pageable.getPageNumber())
            .size(pageable.getPageSize())
            .executionTimeMs(0) // Could be measured
            .generatedSql(sql)
            .build();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> executeExportQuery(AdHocQueryRequest request) {
        validateQuery(request);
        String sql = buildSqlQuery(request);
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> row = new LinkedHashMap<>();
            ResultSetMetaData metaData = rs.getMetaData();
            for (int i = 1; i <= metaData.getColumnCount(); i++) {
                row.put(metaData.getColumnLabel(i), convertValue(rs.getObject(i)));
            }
            return row;
        });
    }

    @Transactional
    public SavedQueryDto saveQuery(String userId, AdHocQueryRequest request) {
        SavedQuery query = new SavedQuery();
        query.setName(request.getQueryName());
        query.setDescription(request.getDescription());
        query.setUserId(userId);
        query.setQueryJson(toJson(request));
        query.setCreatedAt(LocalDateTime.now());
        
        SavedQuery saved = savedQueryRepository.save(query);
        return toSavedQueryDto(saved);
    }

    @Transactional(readOnly = true)
    public List<SavedQueryDto> getUserSavedQueries(String userId) {
        return savedQueryRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(this::toSavedQueryDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public SavedQueryDto getSavedQuery(UUID queryId) {
        SavedQuery query = savedQueryRepository.findById(queryId)
            .orElseThrow(() -> new RuntimeException("Query not found"));
        return toSavedQueryDto(query);
    }

    @Transactional
    public void deleteSavedQuery(UUID queryId) {
        savedQueryRepository.deleteById(queryId);
    }

    @Transactional(readOnly = true)
    public List<QueryColumnMetadata> getTableSchema(String tableName) {
        if (!ALLOWED_TABLES.contains(tableName)) {
            throw new IllegalArgumentException("Table not allowed: " + tableName);
        }

        // Query information schema
        String sql = "SELECT column_name, data_type, is_nullable " +
                     "FROM information_schema.columns " +
                     "WHERE table_name = ? AND table_schema = 'public'";

        return jdbcTemplate.query(sql, (rs, rowNum) -> QueryColumnMetadata.builder()
            .name(rs.getString("column_name"))
            .dataType(mapDataType(rs.getString("data_type")))
            .nullable("YES".equals(rs.getString("is_nullable")))
            .build(), tableName);
    }

    @Transactional(readOnly = true)
    public List<String> getAvailableTables() {
        return new ArrayList<>(ALLOWED_TABLES);
    }

    // ==================== Helper Methods ====================

    private void validateQuery(AdHocQueryRequest request) {
        // Validate table access
        if (request.getFromTable() != null && !ALLOWED_TABLES.contains(request.getFromTable())) {
            throw new IllegalArgumentException("Table not allowed: " + request.getFromTable());
        }

        // Validate no dangerous operations
        String queryLower = request.getToSql().toLowerCase();
        if (queryLower.contains("drop") || queryLower.contains("delete") || 
            queryLower.contains("update") || queryLower.contains("insert")) {
            throw new IllegalArgumentException("Only SELECT queries are allowed");
        }
    }

    private String buildSqlQuery(AdHocQueryRequest request) {
        if (request.getRawSql() != null && !request.getRawSql().isEmpty()) {
            return sanitizeSql(request.getRawSql());
        }

        StringBuilder sql = new StringBuilder("SELECT ");
        
        // Build SELECT clause
        if (request.getColumns() != null && !request.getColumns().isEmpty()) {
            sql.append(String.join(", ", request.getColumns()));
        } else {
            sql.append("*");
        }

        // FROM clause
        sql.append(" FROM ").append(request.getFromTable());

        // JOINs
        if (request.getJoins() != null) {
            for (QueryJoin join : request.getJoins()) {
                sql.append(" ").append(join.getJoinType())
                   .append(" JOIN ").append(join.getTable())
                   .append(" ON ").append(join.getOnCondition());
            }
        }

        // WHERE clause
        if (request.getFilters() != null && !request.getFilters().isEmpty()) {
            sql.append(" WHERE ");
            List<String> conditions = new ArrayList<>();
            for (QueryFilter filter : request.getFilters()) {
                conditions.add(buildFilterCondition(filter));
            }
            sql.append(String.join(" AND ", conditions));
        }

        // GROUP BY
        if (request.getGroupBy() != null && !request.getGroupBy().isEmpty()) {
            sql.append(" GROUP BY ").append(String.join(", ", request.getGroupBy()));
        }

        // ORDER BY
        if (request.getOrderBy() != null && !request.getOrderBy().isEmpty()) {
            sql.append(" ORDER BY ").append(String.join(", ", request.getOrderBy()));
            if (request.getOrderDirection() != null) {
                sql.append(" ").append(request.getOrderDirection());
            }
        }

        return sanitizeSql(sql.toString());
    }

    private String buildFilterCondition(QueryFilter filter) {
        String column = filter.getColumn();
        String operator = filter.getOperator();
        Object value = filter.getValue();

        return switch (operator.toUpperCase()) {
            case "EQUALS" -> column + " = '" + value + "'";
            case "NOT_EQUALS" -> column + " <> '" + value + "'";
            case "GREATER_THAN" -> column + " > " + value;
            case "LESS_THAN" -> column + " < " + value;
            case "CONTAINS" -> column + " LIKE '%" + value + "%'";
            case "STARTS_WITH" -> column + " LIKE '" + value + "%'";
            case "IN" -> column + " IN (" + value + ")";
            case "BETWEEN" -> column + " BETWEEN " + ((List<?>) value).get(0) + " AND " + ((List<?>) value).get(1);
            case "IS_NULL" -> column + " IS NULL";
            case "IS_NOT_NULL" -> column + " IS NOT NULL";
            default -> column + " = '" + value + "'";
        };
    }

    private String sanitizeSql(String sql) {
        // Basic sanitization - remove comments
        return sql.replaceAll("--.*", "")
                  .replaceAll("/\\*.*?\\*/", "")
                  .trim();
    }

    private Object convertValue(Object value) {
        if (value == null) return null;
        if (value instanceof java.sql.Timestamp) {
            return ((java.sql.Timestamp) value).toInstant().toString();
        }
        if (value instanceof java.sql.Date) {
            return ((java.sql.Date) value).toLocalDate().toString();
        }
        if (value instanceof BigDecimal) {
            return ((BigDecimal) value).doubleValue();
        }
        return value;
    }

    private List<QueryColumnMetadata> getColumnMetadata(List<Map<String, Object>> results) {
        if (results.isEmpty()) return List.of();

        Map<String, Object> firstRow = results.get(0);
        return firstRow.keySet().stream()
            .map(key -> QueryColumnMetadata.builder()
                .name(key)
                .dataType(inferDataType(firstRow.get(key)))
                .build())
            .toList();
    }

    private String inferDataType(Object value) {
        if (value == null) return "UNKNOWN";
        if (value instanceof Number) return "NUMBER";
        if (value instanceof Boolean) return "BOOLEAN";
        if (value instanceof String && ((String) value).length() > 100) return "TEXT";
        if (value instanceof String) return "STRING";
        return "UNKNOWN";
    }

    private String mapDataType(String dbType) {
        return switch (dbType.toLowerCase()) {
            case "bigint", "int", "integer", "smallint" -> "INTEGER";
            case "decimal", "numeric", "real", "double precision" -> "NUMBER";
            case "varchar", "char", "text" -> "STRING";
            case "timestamp", "timestamptz" -> "DATETIME";
            case "date" -> "DATE";
            case "boolean" -> "BOOLEAN";
            default -> "UNKNOWN";
        };
    }

    private String toJson(AdHocQueryRequest request) {
        try {
            return objectMapper.writeValueAsString(request);
        } catch (Exception e) {
            log.error("Failed to convert request to JSON", e);
            return "";
        }
    }

    private SavedQueryDto toSavedQueryDto(SavedQuery query) {
        return SavedQueryDto.builder()
            .id(query.getId())
            .name(query.getName())
            .description(query.getDescription())
            .userId(query.getUserId())
            .createdAt(query.getCreatedAt())
            .queryJson(query.getQueryJson())
            .build();
    }
}
