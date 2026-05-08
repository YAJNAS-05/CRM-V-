package com.everx.reporting.adhoc;

import com.everx.reporting.adhoc.dto.*;
import com.everx.shared.dto.ApiResponse;
import com.everx.shared.util.SecurityUserContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reporting/adhoc")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('REPORTING_VIEW', 'REPORTING_EDIT', 'ANALYST', 'ADMIN', 'SUPER_ADMIN')")
public class AdHocQueryController {

    private final AdHocQueryService adHocQueryService;

    @PostMapping("/query")
    public ResponseEntity<ApiResponse<AdHocQueryResult>> executeQuery(
            @Valid @RequestBody AdHocQueryRequest request,
            Pageable pageable) {
        AdHocQueryResult result = adHocQueryService.executeQuery(request, pageable);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/query/export")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> exportQuery(
            @Valid @RequestBody AdHocQueryRequest request) {
        List<Map<String, Object>> results = adHocQueryService.executeExportQuery(request);
        return ResponseEntity.ok(ApiResponse.ok(results));
    }

    @GetMapping("/tables")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableTables() {
        List<String> tables = adHocQueryService.getAvailableTables();
        return ResponseEntity.ok(ApiResponse.ok(tables));
    }

    @GetMapping("/schema/{tableName}")
    public ResponseEntity<ApiResponse<List<QueryColumnMetadata>>> getTableSchema(
            @PathVariable String tableName) {
        List<QueryColumnMetadata> schema = adHocQueryService.getTableSchema(tableName);
        return ResponseEntity.ok(ApiResponse.ok(schema));
    }

    @PostMapping("/queries/save")
    public ResponseEntity<ApiResponse<SavedQueryDto>> saveQuery(
            @Valid @RequestBody AdHocQueryRequest request) {
        String userId = SecurityUserContext.getCurrentUserIdOrNull().toString();
        SavedQueryDto saved = adHocQueryService.saveQuery(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(saved, "Query saved successfully"));
    }

    @GetMapping("/queries/saved")
    public ResponseEntity<ApiResponse<List<SavedQueryDto>>> getSavedQueries() {
        String userId = SecurityUserContext.getCurrentUserIdOrNull().toString();
        List<SavedQueryDto> queries = adHocQueryService.getUserSavedQueries(userId);
        return ResponseEntity.ok(ApiResponse.ok(queries));
    }

    @GetMapping("/queries/saved/{queryId}")
    public ResponseEntity<ApiResponse<SavedQueryDto>> getSavedQuery(@PathVariable UUID queryId) {
        SavedQueryDto query = adHocQueryService.getSavedQuery(queryId);
        return ResponseEntity.ok(ApiResponse.ok(query));
    }

    @DeleteMapping("/queries/saved/{queryId}")
    public ResponseEntity<ApiResponse<Void>> deleteSavedQuery(@PathVariable UUID queryId) {
        adHocQueryService.deleteSavedQuery(queryId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Query deleted successfully"));
    }
}
