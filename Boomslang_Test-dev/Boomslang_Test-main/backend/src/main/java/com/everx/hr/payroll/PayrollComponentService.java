package com.everx.hr.payroll;

import com.everx.hr.payroll.dto.CreatePayrollComponentRequest;
import com.everx.hr.payroll.dto.PayrollComponentDto;
import com.everx.hr.payroll.dto.UpdatePayrollComponentRequest;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PayrollComponentService {

    private final PayrollComponentRepository payrollComponentRepository;

    @Transactional
    public PayrollComponentDto createComponent(CreatePayrollComponentRequest request) {
        if (payrollComponentRepository.existsByCodeAndIsDeletedFalse(request.getCode())) {
            throw new ValidationException("Payroll component code already exists: " + request.getCode());
        }

        PayrollComponent component = new PayrollComponent();
        apply(component, request);
        return toDto(payrollComponentRepository.save(component));
    }

    @Transactional(readOnly = true)
    public PayrollComponentDto getComponent(java.util.UUID id) {
        PayrollComponent component = payrollComponentRepository.findById(id)
                .filter(c -> !Boolean.TRUE.equals(c.getIsDeleted()))
                .orElseThrow(() -> new EntityNotFoundException("Payroll component not found with id: " + id));
        return toDto(component);
    }

    @Transactional(readOnly = true)
    public Page<PayrollComponentDto> getComponents(Pageable pageable) {
        return payrollComponentRepository.findAllByIsDeletedFalse(pageable).map(this::toDto);
    }

    @Transactional
    public PayrollComponentDto updateComponent(java.util.UUID id, UpdatePayrollComponentRequest request) {
        PayrollComponent component = payrollComponentRepository.findById(id)
                .filter(c -> !Boolean.TRUE.equals(c.getIsDeleted()))
                .orElseThrow(() -> new EntityNotFoundException("Payroll component not found with id: " + id));

        if (request.getCode() != null && !request.getCode().equals(component.getCode())) {
            if (payrollComponentRepository.existsByCodeAndIsDeletedFalse(request.getCode())) {
                throw new ValidationException("Payroll component code already exists: " + request.getCode());
            }
            component.setCode(request.getCode());
        }

        if (request.getName() != null) component.setName(request.getName());
        if (request.getComponentType() != null) component.setComponentType(request.getComponentType());
        if (request.getCalculationType() != null) component.setCalculationType(request.getCalculationType());
        if (request.getDefaultAmount() != null) component.setDefaultAmount(request.getDefaultAmount());
        if (request.getDefaultPercentage() != null) component.setDefaultPercentage(request.getDefaultPercentage());
        if (request.getTaxable() != null) component.setTaxable(request.getTaxable());
        if (request.getIsActive() != null) component.setIsActive(request.getIsActive());
        if (request.getDescription() != null) component.setDescription(request.getDescription());

        return toDto(payrollComponentRepository.save(component));
    }

    @Transactional
    public PayrollComponentDto toggleComponent(java.util.UUID id, boolean active) {
        PayrollComponent component = payrollComponentRepository.findById(id)
                .filter(c -> !Boolean.TRUE.equals(c.getIsDeleted()))
                .orElseThrow(() -> new EntityNotFoundException("Payroll component not found with id: " + id));
        component.setIsActive(active);
        return toDto(payrollComponentRepository.save(component));
    }

    private void apply(PayrollComponent component, CreatePayrollComponentRequest request) {
        component.setCode(request.getCode());
        component.setName(request.getName());
        component.setComponentType(request.getComponentType());
        component.setCalculationType(request.getCalculationType() != null ? request.getCalculationType() : component.getCalculationType());
        component.setDefaultAmount(request.getDefaultAmount());
        component.setDefaultPercentage(request.getDefaultPercentage());
        component.setTaxable(request.getTaxable() == null || request.getTaxable());
        component.setIsActive(request.getIsActive() == null || request.getIsActive());
        component.setDescription(request.getDescription());
    }

    private PayrollComponentDto toDto(PayrollComponent component) {
        PayrollComponentDto dto = new PayrollComponentDto();
        dto.setId(component.getId());
        dto.setCode(component.getCode());
        dto.setName(component.getName());
        dto.setComponentType(component.getComponentType());
        dto.setCalculationType(component.getCalculationType());
        dto.setDefaultAmount(component.getDefaultAmount());
        dto.setDefaultPercentage(component.getDefaultPercentage());
        dto.setTaxable(component.getTaxable());
        dto.setIsActive(component.getIsActive());
        dto.setDescription(component.getDescription());
        if (component.getCreatedAt() != null) {
            dto.setCreatedAt(component.getCreatedAt().toInstant());
        }
        if (component.getUpdatedAt() != null) {
            dto.setUpdatedAt(component.getUpdatedAt().toInstant());
        }
        return dto;
    }
}
