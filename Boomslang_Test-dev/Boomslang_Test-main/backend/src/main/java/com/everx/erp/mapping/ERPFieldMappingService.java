package com.everx.erp.mapping;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class ERPFieldMappingService {

    private final ERPFieldMappingRepository mappingRepository;
    private final ObjectMapper objectMapper;

    /**
     * Get all field mappings for a source and target module
     */
    public List<ERPFieldMapping> getMappingsForModules(String sourceModule, String targetModule) {
        return mappingRepository.findMappingsBySourceAndTarget(sourceModule, targetModule);
    }

    /**
     * Get all field mappings for a source module
     */
    public List<ERPFieldMapping> getMappingsForSourceModule(String sourceModule) {
        return mappingRepository.findMappingsBySourceModule(sourceModule);
    }

    /**
     * Get all required field mappings for a source module
     */
    public List<ERPFieldMapping> getRequiredMappingsForModule(String sourceModule) {
        return mappingRepository.findRequiredMappingsBySourceModule(sourceModule);
    }

    /**
     * Get available target modules that can be mapped from source module
     */
    public List<String> getTargetModulesForSource(String sourceModule) {
        return mappingRepository.findTargetModulesForSource(sourceModule);
    }

    /**
     * Get lookup values for a specific mapping field
     */
    public List<String> getLookupValuesForField(String sourceModule, String targetModule, String sourceField) {
        Optional<ERPFieldMapping> mapping = mappingRepository.findMapping(sourceModule, targetModule, sourceField);
        if (mapping.isPresent() && mapping.get().getLookupValues() != null) {
            try {
                return objectMapper.readValue(
                    mapping.get().getLookupValues(),
                    new TypeReference<List<String>>() {}
                );
            } catch (Exception e) {
                log.error("Error parsing lookup values for mapping: {}/{}/{}", sourceModule, targetModule, sourceField, e);
                return new ArrayList<>();
            }
        }
        return new ArrayList<>();
    }

    /**
     * Create a new field mapping
     */
    public ERPFieldMapping createMapping(CreateERPFieldMappingRequest request) {
        ERPFieldMapping mapping = ERPFieldMapping.builder()
            .sourceModule(request.getSourceModule())
            .targetModule(request.getTargetModule())
            .sourceField(request.getSourceField())
            .targetField(request.getTargetField())
            .isRequired(request.getIsRequired() != null ? request.getIsRequired() : false)
            .isAutoPopulated(request.getIsAutoPopulated() != null ? request.getIsAutoPopulated() : false)
            .mappingType(request.getMappingType() != null ? request.getMappingType() : "DIRECT")
            .lookupValues(request.getLookupValues())
            .isActive(true)
            .description(request.getDescription())
            .build();

        return mappingRepository.save(mapping);
    }

    /**
     * Update an existing field mapping
     */
    public ERPFieldMapping updateMapping(UUID mappingId, CreateERPFieldMappingRequest request) {
        ERPFieldMapping mapping = mappingRepository.findById(mappingId)
            .orElseThrow(() -> new RuntimeException("Mapping not found: " + mappingId));

        mapping.setSourceField(request.getSourceField());
        mapping.setTargetField(request.getTargetField());
        mapping.setIsRequired(request.getIsRequired());
        mapping.setIsAutoPopulated(request.getIsAutoPopulated());
        mapping.setMappingType(request.getMappingType());
        mapping.setLookupValues(request.getLookupValues());
        mapping.setDescription(request.getDescription());

        return mappingRepository.save(mapping);
    }

    /**
     * Validate that required mappings are configured
     */
    public ValidationResult validateRequiredMappings(String sourceModule, String targetModule, Map<String, String> fieldValues) {
        List<ERPFieldMapping> requiredMappings = getRequiredMappingsForModule(sourceModule);
        List<String> missingFields = new ArrayList<>();

        for (ERPFieldMapping mapping : requiredMappings) {
            String value = fieldValues.get(mapping.getSourceField());
            if (value == null || value.trim().isEmpty()) {
                missingFields.add(mapping.getSourceField());
            }
        }

        if (!missingFields.isEmpty()) {
            return new ValidationResult(false, "Required fields missing: " + String.join(", ", missingFields) + ". Please configure " + sourceModule + " module first.");
        }

        return new ValidationResult(true, "All required mappings are valid");
    }

    /**
     * Get all active mappings with pagination
     */
    public Page<ERPFieldMapping> getAllMappings(Pageable pageable) {
        return mappingRepository.findAllActiveMappings(pageable);
    }

    /**
     * Deactivate a mapping
     */
    public ERPFieldMapping deactivateMapping(UUID mappingId) {
        ERPFieldMapping mapping = mappingRepository.findById(mappingId)
            .orElseThrow(() -> new RuntimeException("Mapping not found: " + mappingId));
        mapping.setIsActive(false);
        return mappingRepository.save(mapping);
    }

    /**
     * Delete a mapping
     */
    public void deleteMapping(UUID mappingId) {
        ERPFieldMapping mapping = mappingRepository.findById(mappingId)
            .orElseThrow(() -> new RuntimeException("Mapping not found: " + mappingId));
        mapping.setIsDeleted(true);
        mappingRepository.save(mapping);
    }

    public static class ValidationResult {
        public boolean isValid;
        public String message;

        public ValidationResult(boolean isValid, String message) {
            this.isValid = isValid;
            this.message = message;
        }

        public boolean isValid() {
            return isValid;
        }

        public String getMessage() {
            return message;
        }
    }
}
