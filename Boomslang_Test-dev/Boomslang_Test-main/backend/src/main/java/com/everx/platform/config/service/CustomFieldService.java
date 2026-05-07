package com.everx.platform.config.service;

import com.everx.platform.config.dto.*;
import com.everx.platform.config.entity.CustomFieldDefinition;
import com.everx.platform.config.entity.CustomFieldValue;
import com.everx.platform.config.repository.CustomFieldDefinitionRepository;
import com.everx.platform.config.repository.CustomFieldValueRepository;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomFieldService {

    private final CustomFieldDefinitionRepository definitionRepository;
    private final CustomFieldValueRepository valueRepository;

    @Transactional(readOnly = true)
    public List<CustomFieldDefinitionDto> listDefinitions(String module, String entity, boolean includeInactive) {
        List<CustomFieldDefinition> definitions = includeInactive
                ? definitionRepository.findByModuleAndEntityAndIsDeletedFalseOrderBySortOrderAsc(module, entity)
                : definitionRepository.findByModuleAndEntityAndIsActiveTrueAndIsDeletedFalseOrderBySortOrderAsc(module, entity);
        return definitions.stream().map(CustomFieldDefinitionDto::fromEntity).toList();
    }

    public CustomFieldDefinitionDto createDefinition(CreateCustomFieldDefinitionRequest request) {
        definitionRepository.findByModuleAndEntityAndFieldKeyAndIsDeletedFalse(
                request.getModule(), request.getEntity(), request.getFieldKey())
                .ifPresent(existing -> {
                    throw new ValidationException("Custom field already exists for module/entity/key");
                });

        CustomFieldDefinition definition = CustomFieldDefinition.builder()
                .module(request.getModule())
                .entity(request.getEntity())
                .fieldKey(request.getFieldKey())
                .label(request.getLabel())
                .dataType(request.getDataType())
                .helpText(request.getHelpText())
                .defaultValue(request.getDefaultValue())
                .optionsJson(request.getOptionsJson())
                .sortOrder(request.getSortOrder())
                .isRequired(request.getIsRequired() != null ? request.getIsRequired() : false)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .isSystem(request.getIsSystem() != null ? request.getIsSystem() : false)
                .build();

        return CustomFieldDefinitionDto.fromEntity(definitionRepository.save(definition));
    }

    public CustomFieldDefinitionDto updateDefinition(UUID definitionId, UpdateCustomFieldDefinitionRequest request) {
        CustomFieldDefinition definition = definitionRepository.findById(definitionId)
                .orElseThrow(() -> new EntityNotFoundException("Custom field definition not found"));

        if (request.getLabel() != null) definition.setLabel(request.getLabel());
        if (request.getDataType() != null) definition.setDataType(request.getDataType());
        if (request.getHelpText() != null) definition.setHelpText(request.getHelpText());
        if (request.getDefaultValue() != null) definition.setDefaultValue(request.getDefaultValue());
        if (request.getOptionsJson() != null) definition.setOptionsJson(request.getOptionsJson());
        if (request.getSortOrder() != null) definition.setSortOrder(request.getSortOrder());
        if (request.getIsRequired() != null) definition.setIsRequired(request.getIsRequired());
        if (request.getIsActive() != null) definition.setIsActive(request.getIsActive());

        return CustomFieldDefinitionDto.fromEntity(definitionRepository.save(definition));
    }

    public void deleteDefinition(UUID definitionId) {
        CustomFieldDefinition definition = definitionRepository.findById(definitionId)
                .orElseThrow(() -> new EntityNotFoundException("Custom field definition not found"));
        definition.softDelete();
        definitionRepository.save(definition);
    }

    @Transactional(readOnly = true)
    public List<CustomFieldValueDto> getValues(String module, String entity, String entityId) {
        List<CustomFieldDefinition> definitions = definitionRepository
                .findByModuleAndEntityAndIsActiveTrueAndIsDeletedFalseOrderBySortOrderAsc(module, entity);

        if (definitions.isEmpty()) {
            return List.of();
        }

        List<CustomFieldValue> values = valueRepository.findByDefinitionInAndEntityIdAndIsDeletedFalse(definitions, entityId);
        Map<UUID, CustomFieldValue> byDefinition = values.stream()
                .collect(Collectors.toMap(value -> value.getDefinition().getId(), Function.identity()));

        return definitions.stream()
                .map(definition -> {
                    CustomFieldValue value = byDefinition.get(definition.getId());
                    if (value == null) {
                        return CustomFieldValueDto.builder()
                                .definitionId(definition.getId())
                                .fieldKey(definition.getFieldKey())
                                .value(definition.getDefaultValue())
                                .build();
                    }
                    return CustomFieldValueDto.fromEntity(value);
                })
                .toList();
    }

    public List<CustomFieldValueDto> upsertValues(UpsertCustomFieldValuesRequest request) {
        List<CustomFieldDefinition> definitions = definitionRepository
                .findByModuleAndEntityAndIsActiveTrueAndIsDeletedFalseOrderBySortOrderAsc(request.getModule(), request.getEntity());

        Map<String, CustomFieldDefinition> byKey = definitions.stream()
                .collect(Collectors.toMap(CustomFieldDefinition::getFieldKey, Function.identity()));

        List<CustomFieldValue> updated = request.getValues().stream()
                .map(input -> {
                    CustomFieldDefinition definition = byKey.get(input.getFieldKey());
                    if (definition == null) {
                        throw new ValidationException("Unknown custom field: " + input.getFieldKey());
                    }

                    CustomFieldValue value = valueRepository
                            .findByDefinitionAndEntityIdAndIsDeletedFalse(definition, request.getEntityId())
                            .orElseGet(() -> CustomFieldValue.builder()
                                    .definition(definition)
                                    .entityId(request.getEntityId())
                                    .build());
                    value.setValue(input.getValue());
                    return valueRepository.save(value);
                })
                .toList();

        return updated.stream().map(CustomFieldValueDto::fromEntity).toList();
    }
}
