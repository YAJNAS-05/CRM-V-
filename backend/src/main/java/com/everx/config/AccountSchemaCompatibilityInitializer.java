package com.everx.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.SQLException;
import java.util.Locale;

/**
 * Repairs known legacy CRM accounts table shape mismatches at startup.
 *
 * This keeps existing databases compatible with the current Account entity mapping
 * without requiring manual intervention.
 */
@Component
@Order(0)
@RequiredArgsConstructor
@Slf4j
public class AccountSchemaCompatibilityInitializer implements ApplicationRunner {

    private static final String SCHEMA = "everx_crm";
    private static final String TABLE = "accounts";

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    @Override
    public void run(ApplicationArguments args) {
        try {
            if (!tableExists(SCHEMA, TABLE)) {
                return;
            }

            alignLegacyAccountColumns();
            normalizeCreatedByColumnTypeIfNeeded();
        } catch (Exception ex) {
            log.warn("Accounts schema compatibility check skipped: {}", ex.getMessage());
        }
    }

    private void alignLegacyAccountColumns() {
        // Legacy aliases observed in older schemas
        renameColumnIfNeeded("company_name", "name");
        renameColumnIfNeeded("account_name", "name");
        renameColumnIfNeeded("assigned_to", "owner_id");

        // Fill name from legacy aliases when both columns exist
        if (columnExists("name") && columnExists("company_name")) {
            safeExecute("UPDATE " + SCHEMA + "." + TABLE + " SET name = company_name WHERE name IS NULL AND company_name IS NOT NULL");
        }
        if (columnExists("name") && columnExists("account_name")) {
            safeExecute("UPDATE " + SCHEMA + "." + TABLE + " SET name = account_name WHERE name IS NULL AND account_name IS NOT NULL");
        }

        // Ensure columns used by current Account entity exist
        addColumnIfMissing("account_type", "VARCHAR(50)");
        addColumnIfMissing("email", "VARCHAR(255)");
        addColumnIfMissing("billing_street", "TEXT");
        addColumnIfMissing("billing_city", "VARCHAR(100)");
        addColumnIfMissing("billing_state", "VARCHAR(100)");
        addColumnIfMissing("billing_zip", "VARCHAR(20)");
        addColumnIfMissing("billing_country", "VARCHAR(100)");
        addColumnIfMissing("annual_revenue", "NUMERIC(18,2)");
        addColumnIfMissing("employees", "INTEGER");
        addColumnIfMissing("description", "TEXT");
        addColumnIfMissing("owner_id", "UUID");
        addColumnIfMissing("country", "VARCHAR(100)");
        addColumnIfMissing("region", "VARCHAR(100)");
        addColumnIfMissing("notes", "TEXT");
        addColumnIfMissing("tags", "TEXT ARRAY");

        // Keep owner_id populated from legacy assigned_to when both exist
        if (columnExists("owner_id") && columnExists("assigned_to")) {
            safeExecute("UPDATE " + SCHEMA + "." + TABLE + " SET owner_id = assigned_to WHERE owner_id IS NULL AND assigned_to IS NOT NULL");
        }

        // Ensure non-null account names for legacy null rows
        if (columnExists("name")) {
            safeExecute("UPDATE " + SCHEMA + "." + TABLE + " SET name = 'Unnamed Account' WHERE name IS NULL");
        }
    }

    private void normalizeCreatedByColumnTypeIfNeeded() {
        if (!columnExists("created_by")) {
            return;
        }

        String type = columnType("created_by");
        if (type == null) {
            return;
        }

        if ("uuid".equalsIgnoreCase(type)) {
            return;
        }

        String product = databaseProductName();
        if (product == null || !product.toLowerCase(Locale.ROOT).contains("postgres")) {
            return;
        }

        // Convert legacy text/varchar created_by values to UUID safely.
        addColumnIfMissing("created_by_uuid_tmp", "UUID");
        safeExecute(
            "UPDATE " + SCHEMA + "." + TABLE + " SET created_by_uuid_tmp = created_by::uuid " +
            "WHERE created_by IS NOT NULL " +
            "AND created_by ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'"
        );

        safeExecute("ALTER TABLE " + SCHEMA + "." + TABLE + " DROP COLUMN created_by");
        safeExecute("ALTER TABLE " + SCHEMA + "." + TABLE + " RENAME COLUMN created_by_uuid_tmp TO created_by");
    }

    private void renameColumnIfNeeded(String oldColumn, String newColumn) {
        if (columnExists(newColumn) || !columnExists(oldColumn)) {
            return;
        }

        safeExecute("ALTER TABLE " + SCHEMA + "." + TABLE + " RENAME COLUMN " + oldColumn + " TO " + newColumn);
    }

    private void addColumnIfMissing(String column, String definition) {
        if (columnExists(column)) {
            return;
        }

        safeExecute("ALTER TABLE " + SCHEMA + "." + TABLE + " ADD COLUMN " + column + " " + definition);
    }

    private void safeExecute(String sql) {
        try {
            jdbcTemplate.execute(sql);
        } catch (Exception ex) {
            log.warn("Accounts schema compatibility SQL skipped. SQL='{}', reason='{}'", sql, ex.getMessage());
        }
    }

    private boolean tableExists(String schema, String table) {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM information_schema.tables WHERE LOWER(table_schema) = ? AND LOWER(table_name) = ?",
            Integer.class,
            schema.toLowerCase(Locale.ROOT),
            table.toLowerCase(Locale.ROOT)
        );
        return count != null && count > 0;
    }

    private boolean columnExists(String column) {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM information_schema.columns WHERE LOWER(table_schema) = ? AND LOWER(table_name) = ? AND LOWER(column_name) = ?",
            Integer.class,
            SCHEMA.toLowerCase(Locale.ROOT),
            TABLE.toLowerCase(Locale.ROOT),
            column.toLowerCase(Locale.ROOT)
        );
        return count != null && count > 0;
    }

    private String columnType(String column) {
        try {
            return jdbcTemplate.queryForObject(
                "SELECT data_type FROM information_schema.columns WHERE LOWER(table_schema) = ? AND LOWER(table_name) = ? AND LOWER(column_name) = ?",
                String.class,
                SCHEMA.toLowerCase(Locale.ROOT),
                TABLE.toLowerCase(Locale.ROOT),
                column.toLowerCase(Locale.ROOT)
            );
        } catch (Exception ex) {
            return null;
        }
    }

    private String databaseProductName() {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData meta = connection.getMetaData();
            return meta.getDatabaseProductName();
        } catch (SQLException ex) {
            return null;
        }
    }
}
