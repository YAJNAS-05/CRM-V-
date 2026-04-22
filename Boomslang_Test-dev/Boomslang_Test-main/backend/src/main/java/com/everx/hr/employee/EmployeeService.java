package com.everx.hr.employee;

import com.everx.auth.entity.User;
import com.everx.auth.repository.UserRepository;
import com.everx.hr.employee.dto.CreateEmployeeRequest;
import com.everx.hr.employee.dto.EmployeeDto;
import com.everx.hr.employee.dto.UpdateEmployeeRequest;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    @Transactional
    public EmployeeDto createEmployee(CreateEmployeeRequest request) {
        if (employeeRepository.existsByEmployeeCode(request.getEmployeeCode())) {
            throw new ValidationException("Employee code already exists: " + request.getEmployeeCode());
        }

        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + request.getUserId()));
            if (!Boolean.TRUE.equals(user.getIsActive())) {
                throw new ValidationException("User is not active: " + request.getUserId());
            }
            if (employeeRepository.existsByUserId(request.getUserId())) {
                throw new ValidationException("User already mapped to an employee record: " + request.getUserId());
            }
        }

        Employee employee = new Employee();
        applyCreate(employee, request);
        return toDto(employeeRepository.save(employee));
    }

    @Transactional(readOnly = true)
    public EmployeeDto getEmployeeById(UUID id) {
        Employee employee = employeeRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + id));
        return toDto(employee);
    }

    @Transactional(readOnly = true)
    public Page<EmployeeDto> getEmployees(Pageable pageable) {
        return employeeRepository.findAllNotDeleted(pageable).map(this::toDto);
    }

    @Transactional
    public EmployeeDto updateEmployee(UUID id, UpdateEmployeeRequest request) {
        Employee employee = employeeRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + id));

        if (request.getEmployeeCode() != null && !request.getEmployeeCode().equals(employee.getEmployeeCode())) {
            if (employeeRepository.existsByEmployeeCode(request.getEmployeeCode())) {
                throw new ValidationException("Employee code already exists: " + request.getEmployeeCode());
            }
            employee.setEmployeeCode(request.getEmployeeCode());
        }

        if (request.getUserId() != null && !request.getUserId().equals(employee.getUserId())) {
            userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + request.getUserId()));
            if (employeeRepository.existsByUserId(request.getUserId())) {
                throw new ValidationException("User already mapped to an employee record: " + request.getUserId());
            }
            employee.setUserId(request.getUserId());
        }

        updateIfPresent(request.getFirstName(), employee::setFirstName);
        updateIfPresent(request.getLastName(), employee::setLastName);
        updateIfPresent(request.getEmail(), employee::setEmail);
        updateIfPresent(request.getPhone(), employee::setPhone);
        updateIfPresent(request.getDepartmentId(), employee::setDepartmentId);
        updateIfPresent(request.getPositionId(), employee::setPositionId);
        updateIfPresent(request.getManagerId(), employee::setManagerId);
        updateIfPresent(request.getEmploymentType(), employee::setEmploymentType);
        updateIfPresent(request.getStatus(), employee::setStatus);
        updateIfPresent(request.getHireDate(), employee::setHireDate);
        updateIfPresent(request.getTerminationDate(), employee::setTerminationDate);

        return toDto(employeeRepository.save(employee));
    }

    @Transactional
    public void deleteEmployee(UUID id) {
        Employee employee = employeeRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + id));
        employee.softDelete();
        employeeRepository.save(employee);
    }

    private void applyCreate(Employee employee, CreateEmployeeRequest request) {
        employee.setUserId(request.getUserId());
        employee.setEmployeeCode(request.getEmployeeCode());
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setDepartmentId(request.getDepartmentId());
        employee.setPositionId(request.getPositionId());
        employee.setManagerId(request.getManagerId());
        employee.setEmploymentType(request.getEmploymentType());
        employee.setStatus(request.getStatus() != null ? request.getStatus() : employee.getStatus());
        employee.setHireDate(request.getHireDate());
        employee.setTerminationDate(request.getTerminationDate());
    }

    private EmployeeDto toDto(Employee employee) {
        EmployeeDto dto = new EmployeeDto();
        dto.setId(employee.getId());
        dto.setUserId(employee.getUserId());
        dto.setEmployeeCode(employee.getEmployeeCode());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setEmail(employee.getEmail());
        dto.setPhone(employee.getPhone());
        dto.setDepartmentId(employee.getDepartmentId());
        dto.setPositionId(employee.getPositionId());
        dto.setManagerId(employee.getManagerId());
        dto.setEmploymentType(employee.getEmploymentType());
        dto.setStatus(employee.getStatus());
        dto.setHireDate(employee.getHireDate());
        dto.setTerminationDate(employee.getTerminationDate());
        if (employee.getCreatedAt() != null) {
            dto.setCreatedAt(employee.getCreatedAt().toInstant());
        }
        if (employee.getUpdatedAt() != null) {
            dto.setUpdatedAt(employee.getUpdatedAt().toInstant());
        }
        return dto;
    }

    private <T> void updateIfPresent(T value, java.util.function.Consumer<T> setter) {
        if (value != null) {
            setter.accept(value);
        }
    }
}
