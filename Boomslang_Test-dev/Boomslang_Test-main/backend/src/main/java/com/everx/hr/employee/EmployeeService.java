package com.everx.hr.employee;

import com.everx.auth.entity.User;
import com.everx.auth.repository.UserRepository;
import com.everx.hr.EmployeeStatus;
import com.everx.hr.EmploymentType;
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
    public Page<EmployeeDto> getEmployees(Pageable pageable,
                                          String search,
                                          EmployeeStatus status,
                                          EmploymentType employmentType,
                                          UUID departmentId,
                                          UUID positionId) {
        return employeeRepository.findAllFiltered(search, status, employmentType, departmentId, positionId, pageable)
                .map(this::toDto);
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
        updateIfPresent(request.getDateOfBirth(), employee::setDateOfBirth);
        updateIfPresent(request.getGender(), employee::setGender);
        updateIfPresent(request.getNationality(), employee::setNationality);
        updateIfPresent(request.getAvatarUrl(), employee::setAvatarUrl);
        updateIfPresent(request.getProbationEndDate(), employee::setProbationEndDate);
        updateIfPresent(request.getConfirmationDate(), employee::setConfirmationDate);
        updateIfPresent(request.getWorkLocation(), employee::setWorkLocation);
        updateIfPresent(request.getLifecycleStage(), employee::setLifecycleStage);
        updateIfPresent(request.getEmergencyContactName(), employee::setEmergencyContactName);
        updateIfPresent(request.getEmergencyContactPhone(), employee::setEmergencyContactPhone);
        updateIfPresent(request.getEmergencyContactRelation(), employee::setEmergencyContactRelation);
        updateIfPresent(request.getPanNumber(), employee::setPanNumber);
        updateIfPresent(request.getAadhaarMasked(), employee::setAadhaarMasked);
        updateIfPresent(request.getPassportNumber(), employee::setPassportNumber);
        updateIfPresent(request.getAddressLine1(), employee::setAddressLine1);
        updateIfPresent(request.getAddressCity(), employee::setAddressCity);
        updateIfPresent(request.getAddressState(), employee::setAddressState);
        updateIfPresent(request.getAddressCountry(), employee::setAddressCountry);
        updateIfPresent(request.getAddressPincode(), employee::setAddressPincode);

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

        employee.setDateOfBirth(request.getDateOfBirth());
        employee.setGender(request.getGender());
        employee.setNationality(request.getNationality());
        employee.setAvatarUrl(request.getAvatarUrl());
        employee.setProbationEndDate(request.getProbationEndDate());
        employee.setConfirmationDate(request.getConfirmationDate());
        if (request.getWorkLocation() != null) employee.setWorkLocation(request.getWorkLocation());
        if (request.getLifecycleStage() != null) employee.setLifecycleStage(request.getLifecycleStage());
        employee.setEmergencyContactName(request.getEmergencyContactName());
        employee.setEmergencyContactPhone(request.getEmergencyContactPhone());
        employee.setEmergencyContactRelation(request.getEmergencyContactRelation());
        employee.setAddressLine1(request.getAddressLine1());
        employee.setAddressCity(request.getAddressCity());
        employee.setAddressState(request.getAddressState());
        employee.setAddressCountry(request.getAddressCountry());
        employee.setAddressPincode(request.getAddressPincode());
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
        dto.setDateOfBirth(employee.getDateOfBirth());
        dto.setGender(employee.getGender());
        dto.setNationality(employee.getNationality());
        dto.setAvatarUrl(employee.getAvatarUrl());
        dto.setProbationEndDate(employee.getProbationEndDate());
        dto.setConfirmationDate(employee.getConfirmationDate());
        dto.setWorkLocation(employee.getWorkLocation());
        dto.setLifecycleStage(employee.getLifecycleStage());
        dto.setEmergencyContactName(employee.getEmergencyContactName());
        dto.setEmergencyContactPhone(employee.getEmergencyContactPhone());
        dto.setEmergencyContactRelation(employee.getEmergencyContactRelation());
        dto.setAddressLine1(employee.getAddressLine1());
        dto.setAddressCity(employee.getAddressCity());
        dto.setAddressState(employee.getAddressState());
        dto.setAddressCountry(employee.getAddressCountry());
        dto.setAddressPincode(employee.getAddressPincode());
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
