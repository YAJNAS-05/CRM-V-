package com.everx.hr.employee;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.everx.hr.EmployeeStatus;
import com.everx.hr.EmploymentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;
import java.util.List;
import java.util.UUID;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    @Query("SELECT e FROM Employee e WHERE e.isDeleted = false AND e.id = :id")
    Optional<Employee> findByIdAndNotDeleted(@Param("id") UUID id);

    @Query("SELECT e FROM Employee e WHERE e.isDeleted = false")
    Page<Employee> findAllNotDeleted(Pageable pageable);

        @Query("""
                        SELECT e FROM Employee e
                        WHERE e.isDeleted = false
                            AND (:search IS NULL OR :search = '' OR
                                     LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :search, '%')) OR
                                     LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                                     LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                                     LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%')))
                            AND (:status IS NULL OR e.status = :status)
                            AND (:employmentType IS NULL OR e.employmentType = :employmentType)
                            AND (:departmentId IS NULL OR e.departmentId = :departmentId)
                            AND (:positionId IS NULL OR e.positionId = :positionId)
                        """)
        Page<Employee> findAllFiltered(@Param("search") String search,
                                                                     @Param("status") EmployeeStatus status,
                                                                     @Param("employmentType") EmploymentType employmentType,
                                                                     @Param("departmentId") UUID departmentId,
                                                                     @Param("positionId") UUID positionId,
                                                                     Pageable pageable);

    boolean existsByEmployeeCode(String employeeCode);

    boolean existsByUserId(UUID userId);

    @Query("SELECT e FROM Employee e WHERE e.isDeleted = false AND e.status = :status")
    List<Employee> findByStatus(@Param("status") EmployeeStatus status);

    @Query("SELECT e FROM Employee e WHERE e.isDeleted = false AND e.userId = :userId")
    Optional<Employee> findByUserIdAndNotDeleted(@Param("userId") UUID userId);

    @Query("SELECT e FROM Employee e WHERE e.isDeleted = false AND e.managerId = :managerId")
    List<Employee> findByManagerIdAndNotDeleted(@Param("managerId") UUID managerId);

    long countByIsDeletedFalse();

    long countByStatusAndIsDeletedFalse(EmployeeStatus status);

    long countByHireDateBetweenAndIsDeletedFalse(LocalDate startDate, LocalDate endDate);

    long countByHireDateAfterAndIsDeletedFalse(LocalDate startDate);

    long countByTerminationDateBetweenAndIsDeletedFalse(LocalDate startDate, LocalDate endDate);
}
