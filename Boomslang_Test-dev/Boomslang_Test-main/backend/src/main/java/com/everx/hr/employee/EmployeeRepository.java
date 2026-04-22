package com.everx.hr.employee;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.everx.hr.EmployeeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    @Query("SELECT e FROM Employee e WHERE e.isDeleted = false AND e.id = :id")
    Optional<Employee> findByIdAndNotDeleted(@Param("id") UUID id);

    @Query("SELECT e FROM Employee e WHERE e.isDeleted = false")
    Page<Employee> findAllNotDeleted(Pageable pageable);

    boolean existsByEmployeeCode(String employeeCode);

    boolean existsByUserId(UUID userId);

    @Query("SELECT e FROM Employee e WHERE e.isDeleted = false AND e.status = :status")
    List<Employee> findByStatus(@Param("status") EmployeeStatus status);

    @Query("SELECT e FROM Employee e WHERE e.isDeleted = false AND e.userId = :userId")
    Optional<Employee> findByUserIdAndNotDeleted(@Param("userId") UUID userId);

    @Query("SELECT e FROM Employee e WHERE e.isDeleted = false AND e.managerId = :managerId")
    List<Employee> findByManagerIdAndNotDeleted(@Param("managerId") UUID managerId);
}
