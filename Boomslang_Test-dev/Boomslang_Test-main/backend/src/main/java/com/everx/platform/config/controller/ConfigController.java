package com.everx.platform.config.controller;

import com.everx.platform.config.dto.CustomFieldDefinitionDto;
import com.everx.platform.config.dto.CustomFieldValueDto;
import com.everx.platform.config.dto.LayoutConfigDto;
import com.everx.platform.config.dto.OptionSetDto;
import com.everx.platform.config.dto.UpsertCustomFieldValuesRequest;
import com.everx.platform.config.dto.WorkflowDefinitionDto;
import com.everx.platform.config.service.CustomFieldService;
import com.everx.platform.config.service.LayoutConfigService;
import com.everx.platform.config.service.OptionSetService;
import com.everx.platform.config.service.WorkflowConfigService;
import com.everx.shared.dto.ApiResponse;
import com.everx.shared.util.SecurityUserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/config")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ConfigController {

    private final OptionSetService optionSetService;
    private final CustomFieldService customFieldService;
    private final LayoutConfigService layoutConfigService;
    private final WorkflowConfigService workflowConfigService;

    @GetMapping("/option-sets")
    public ResponseEntity<ApiResponse<?>> getOptionSets(
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String entity,
            @RequestParam(required = false) String field,
            @RequestParam(defaultValue = "false") boolean includeInactiveValues) {
        if (module != null && entity != null && field != null) {
            OptionSetDto optionSet = optionSetService.getOptionSet(module, entity, field, includeInactiveValues);
            return ResponseEntity.ok(ApiResponse.ok(optionSet));
        }

        List<OptionSetDto> optionSets = optionSetService.listOptionSets(module);
        return ResponseEntity.ok(ApiResponse.ok(optionSets));
    }

    @GetMapping("/custom-fields")
    public ResponseEntity<ApiResponse<List<CustomFieldDefinitionDto>>> getCustomFields(
            @RequestParam String module,
            @RequestParam String entity,
            @RequestParam(defaultValue = "false") boolean includeInactive) {
        return ResponseEntity.ok(ApiResponse.ok(
                customFieldService.listDefinitions(module, entity, includeInactive)));
    }

    @GetMapping("/custom-fields/values")
    public ResponseEntity<ApiResponse<List<CustomFieldValueDto>>> getCustomFieldValues(
            @RequestParam String module,
            @RequestParam String entity,
            @RequestParam String entityId) {
        return ResponseEntity.ok(ApiResponse.ok(
                customFieldService.getValues(module, entity, entityId)));
    }

    @PostMapping("/custom-fields/values")
    public ResponseEntity<ApiResponse<List<CustomFieldValueDto>>> upsertCustomFieldValues(
            @Valid @RequestBody UpsertCustomFieldValuesRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                customFieldService.upsertValues(request), "Custom fields saved"));
    }

    @GetMapping("/layouts/default")
    public ResponseEntity<ApiResponse<LayoutConfigDto>> getDefaultLayout(
            @RequestParam String module,
            @RequestParam String entity) {
        return ResponseEntity.ok(ApiResponse.ok(layoutConfigService.getDefaultLayout(module, entity)));
    }

    @GetMapping("/layouts/active")
    public ResponseEntity<ApiResponse<LayoutConfigDto>> getActiveLayout(
            @RequestParam String module,
            @RequestParam String entity) {
        return ResponseEntity.ok(ApiResponse.ok(
                layoutConfigService.getActiveLayout(module, entity, SecurityUserContext.getCurrentUserRoles())));
    }

    @GetMapping("/workflows")
    public ResponseEntity<ApiResponse<List<WorkflowDefinitionDto>>> getWorkflows(
            @RequestParam String module,
            @RequestParam String entity) {
        return ResponseEntity.ok(ApiResponse.ok(workflowConfigService.listWorkflows(module, entity)));
    }
}
