package com.everx.hr.department;

import com.everx.hr.department.dto.CreateDepartmentRequest;
import com.everx.hr.department.dto.DepartmentDto;
import com.everx.hr.department.dto.UpdateDepartmentRequest;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Transactional
    public DepartmentDto createDepartment(CreateDepartmentRequest request) {
        if (departmentRepository.findByCodeAndIsDeletedFalse(request.getCode()).isPresent()) {
            throw new ValidationException("Department code already exists: " + request.getCode());
        }

        Department department = new Department();
        department.setCode(request.getCode());
        department.setName(request.getName());
        department.setParentDepartmentId(request.getParentDepartmentId());
        department.setManagerEmployeeId(request.getManagerEmployeeId());

        return toDto(departmentRepository.save(department));
    }

    @Transactional(readOnly = true)
    public DepartmentDto getDepartmentById(java.util.UUID id) {
        Department department = departmentRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Department not found with id: " + id));
        return toDto(department);
    }

    @Transactional(readOnly = true)
    public Page<DepartmentDto> getDepartments(Pageable pageable, String search) {
        return departmentRepository.findAllFiltered(search, pageable).map(this::toDto);
    }

    @Transactional
    public DepartmentDto updateDepartment(java.util.UUID id, UpdateDepartmentRequest request) {
        Department department = departmentRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Department not found with id: " + id));

        if (request.getCode() != null && !request.getCode().equals(department.getCode())) {
            if (departmentRepository.findByCodeAndIsDeletedFalse(request.getCode()).isPresent()) {
                throw new ValidationException("Department code already exists: " + request.getCode());
            }
            department.setCode(request.getCode());
        }

        if (request.getName() != null) department.setName(request.getName());
        if (request.getParentDepartmentId() != null) department.setParentDepartmentId(request.getParentDepartmentId());
        if (request.getManagerEmployeeId() != null) department.setManagerEmployeeId(request.getManagerEmployeeId());

        return toDto(departmentRepository.save(department));
    }

    @Transactional
    public void deleteDepartment(java.util.UUID id) {
        Department department = departmentRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Department not found with id: " + id));
        department.softDelete();
        departmentRepository.save(department);
    }

    private DepartmentDto toDto(Department department) {
        DepartmentDto dto = new DepartmentDto();
        dto.setId(department.getId());
        dto.setCode(department.getCode());
        dto.setName(department.getName());
        dto.setParentDepartmentId(department.getParentDepartmentId());
        dto.setManagerEmployeeId(department.getManagerEmployeeId());
        if (department.getCreatedAt() != null) {
            dto.setCreatedAt(department.getCreatedAt().toInstant());
        }
        if (department.getUpdatedAt() != null) {
            dto.setUpdatedAt(department.getUpdatedAt().toInstant());
        }
        return dto;
    }
}
