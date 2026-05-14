package com.everx.hr.payslip;

import com.everx.hr.payslip.dto.CreatePayslipRequest;
import com.everx.hr.payslip.dto.PayslipDto;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayslipService {

    private final PayslipRepository payslipRepository;

    @Transactional
    public PayslipDto create(CreatePayslipRequest request) {
        Payslip payslip = new Payslip();
        payslip.setEmployeeId(request.getEmployeeId());
        payslip.setPayrollRunId(request.getPayrollRunId());
        payslip.setPayPeriodStart(request.getPayPeriodStart());
        payslip.setPayPeriodEnd(request.getPayPeriodEnd());
        payslip.setGrossPay(request.getGrossPay());
        payslip.setDeductions(request.getDeductions());
        payslip.setNetPay(request.getNetPay());
        payslip.setTaxAmount(request.getTaxAmount());
        payslip.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
        payslip.setNotes(request.getNotes());
        payslip.setStatus(PayslipStatus.GENERATED);
        return toDto(payslipRepository.save(payslip));
    }

    @Transactional(readOnly = true)
    public PayslipDto getById(UUID id) {
        return toDto(payslipRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Payslip not found: " + id)));
    }

    @Transactional(readOnly = true)
    public Page<PayslipDto> getAll(Pageable pageable, UUID employeeId, UUID payrollRunId) {
        return payslipRepository.findAllFiltered(employeeId, payrollRunId, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<PayslipDto> getByEmployee(UUID employeeId) {
        return payslipRepository.findByEmployeeId(employeeId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PayslipDto acknowledge(UUID id) {
        Payslip payslip = payslipRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Payslip not found: " + id));
        payslip.setStatus(PayslipStatus.ACKNOWLEDGED);
        return toDto(payslipRepository.save(payslip));
    }

    private PayslipDto toDto(Payslip p) {
        PayslipDto dto = new PayslipDto();
        dto.setId(p.getId());
        dto.setEmployeeId(p.getEmployeeId());
        dto.setPayrollRunId(p.getPayrollRunId());
        dto.setPayPeriodStart(p.getPayPeriodStart());
        dto.setPayPeriodEnd(p.getPayPeriodEnd());
        dto.setGrossPay(p.getGrossPay());
        dto.setDeductions(p.getDeductions());
        dto.setNetPay(p.getNetPay());
        dto.setTaxAmount(p.getTaxAmount());
        dto.setCurrency(p.getCurrency());
        dto.setStatus(p.getStatus());
        dto.setNotes(p.getNotes());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }
}
