package com.everx.platform.config.service;

import com.everx.platform.config.dto.*;
import com.everx.platform.config.entity.OptionSet;
import com.everx.platform.config.entity.OptionValue;
import com.everx.platform.config.repository.OptionSetRepository;
import com.everx.platform.config.repository.OptionValueRepository;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class OptionSetService {

    private final OptionSetRepository optionSetRepository;
    private final OptionValueRepository optionValueRepository;

    @Transactional(readOnly = true)
    public List<OptionSetDto> listOptionSets(String module) {
        List<OptionSet> sets = module != null && !module.isBlank()
                ? optionSetRepository.findByModuleAndIsDeletedFalseOrderByNameAsc(module)
                : optionSetRepository.findByIsActiveTrueAndIsDeletedFalseOrderByNameAsc();

        return sets.stream()
                .map(set -> OptionSetDto.fromEntity(set, getValues(set, false)))
                .toList();
    }

    @Transactional(readOnly = true)
    public OptionSetDto getOptionSet(String module, String entity, String fieldName, boolean includeInactiveValues) {
        OptionSet optionSet = optionSetRepository
                .findByModuleAndEntityAndFieldNameAndIsDeletedFalse(module, entity, fieldName)
                .orElseThrow(() -> new EntityNotFoundException("Option set not found"));

        return OptionSetDto.fromEntity(optionSet, getValues(optionSet, includeInactiveValues));
    }

    public OptionSetDto createOptionSet(CreateOptionSetRequest request) {
        optionSetRepository.findByModuleAndEntityAndFieldNameAndIsDeletedFalse(
                request.getModule(), request.getEntity(), request.getFieldName())
                .ifPresent(existing -> {
                    throw new ValidationException("Option set already exists for module/entity/field");
                });

        OptionSet optionSet = OptionSet.builder()
                .module(request.getModule())
                .entity(request.getEntity())
                .fieldName(request.getFieldName())
                .name(request.getName())
                .description(request.getDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .isSystem(request.getIsSystem() != null ? request.getIsSystem() : false)
                .build();

        OptionSet saved = optionSetRepository.save(optionSet);
        return OptionSetDto.fromEntity(saved, List.of());
    }

    public OptionSetDto updateOptionSet(UUID optionSetId, UpdateOptionSetRequest request) {
        OptionSet optionSet = optionSetRepository.findById(optionSetId)
                .orElseThrow(() -> new EntityNotFoundException("Option set not found"));

        if (request.getName() != null) optionSet.setName(request.getName());
        if (request.getDescription() != null) optionSet.setDescription(request.getDescription());
        if (request.getIsActive() != null) optionSet.setIsActive(request.getIsActive());

        OptionSet saved = optionSetRepository.save(optionSet);
        return OptionSetDto.fromEntity(saved, getValues(saved, true));
    }

    public void deleteOptionSet(UUID optionSetId) {
        OptionSet optionSet = optionSetRepository.findById(optionSetId)
                .orElseThrow(() -> new EntityNotFoundException("Option set not found"));
        optionSet.softDelete();
        optionSetRepository.save(optionSet);
    }

    public OptionValueDto addOptionValue(UUID optionSetId, CreateOptionValueRequest request) {
        OptionSet optionSet = optionSetRepository.findById(optionSetId)
                .orElseThrow(() -> new EntityNotFoundException("Option set not found"));

        OptionValue value = OptionValue.builder()
                .optionSet(optionSet)
                .value(request.getValue())
                .label(request.getLabel())
                .colorCode(request.getColorCode())
                .sortOrder(request.getSortOrder())
                .description(request.getDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .isDefault(request.getIsDefault() != null ? request.getIsDefault() : false)
                .build();

        return OptionValueDto.fromEntity(optionValueRepository.save(value));
    }

    public OptionValueDto updateOptionValue(UUID optionValueId, UpdateOptionValueRequest request) {
        OptionValue value = optionValueRepository.findById(optionValueId)
                .orElseThrow(() -> new EntityNotFoundException("Option value not found"));

        if (request.getLabel() != null) value.setLabel(request.getLabel());
        if (request.getColorCode() != null) value.setColorCode(request.getColorCode());
        if (request.getSortOrder() != null) value.setSortOrder(request.getSortOrder());
        if (request.getDescription() != null) value.setDescription(request.getDescription());
        if (request.getIsActive() != null) value.setIsActive(request.getIsActive());
        if (request.getIsDefault() != null) value.setIsDefault(request.getIsDefault());

        return OptionValueDto.fromEntity(optionValueRepository.save(value));
    }

    public void deleteOptionValue(UUID optionValueId) {
        OptionValue value = optionValueRepository.findById(optionValueId)
                .orElseThrow(() -> new EntityNotFoundException("Option value not found"));
        value.softDelete();
        optionValueRepository.save(value);
    }

        @Transactional(readOnly = true)
        public boolean isValidOptionValue(String module, String entity, String fieldName, String value) {
                if (value == null || value.isBlank()) {
                        return true;
                }
                OptionSet optionSet = optionSetRepository
                                .findByModuleAndEntityAndFieldNameAndIsDeletedFalse(module, entity, fieldName)
                                .orElse(null);
                if (optionSet == null) {
                        return true;
                }
                return optionValueRepository.existsByOptionSetAndValueIgnoreCaseAndIsActiveTrueAndIsDeletedFalse(optionSet, value);
        }

        @Transactional(readOnly = true)
        public String resolveDefaultValue(String module, String entity, String fieldName, String fallback) {
                OptionSet optionSet = optionSetRepository
                                .findByModuleAndEntityAndFieldNameAndIsDeletedFalse(module, entity, fieldName)
                                .orElse(null);
                if (optionSet == null) {
                        return fallback;
                }

                List<OptionValue> values = optionValueRepository
                                .findByOptionSetAndIsActiveTrueAndIsDeletedFalseOrderBySortOrderAsc(optionSet);
                if (values.isEmpty()) {
                        return fallback;
                }

                return values.stream()
                                .filter(value -> Boolean.TRUE.equals(value.getIsDefault()))
                                .findFirst()
                                .orElse(values.get(0))
                                .getValue();
        }

    private List<OptionValueDto> getValues(OptionSet optionSet, boolean includeInactive) {
        List<OptionValue> values = includeInactive
                ? optionValueRepository.findByOptionSetAndIsDeletedFalseOrderBySortOrderAsc(optionSet)
                : optionValueRepository.findByOptionSetAndIsActiveTrueAndIsDeletedFalseOrderBySortOrderAsc(optionSet);
        return values.stream().map(OptionValueDto::fromEntity).toList();
    }
}
