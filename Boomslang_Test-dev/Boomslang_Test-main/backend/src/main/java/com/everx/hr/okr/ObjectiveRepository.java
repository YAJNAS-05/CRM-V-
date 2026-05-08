package com.everx.hr.okr;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ObjectiveRepository extends JpaRepository<Objective, UUID> {

    @Query("SELECT o FROM Objective o WHERE o.isDeleted = false AND o.id = :id")
    Optional<Objective> findByIdActive(@Param("id") UUID id);

    @Query("SELECT o FROM Objective o LEFT JOIN FETCH o.keyResults kr WHERE o.isDeleted = false AND o.employeeId = :employeeId ORDER BY o.createdAt DESC")
    List<Objective> findByEmployeeId(@Param("employeeId") UUID employeeId);

    @Query("SELECT o FROM Objective o WHERE o.isDeleted = false AND o.cycleId = :cycleId ORDER BY o.createdAt DESC")
    List<Objective> findByCycleId(@Param("cycleId") UUID cycleId);

    @Query("SELECT o FROM Objective o WHERE o.isDeleted = false AND o.employeeId = :employeeId AND o.cycleId = :cycleId ORDER BY o.createdAt DESC")
    List<Objective> findByEmployeeIdAndCycleId(@Param("employeeId") UUID employeeId, @Param("cycleId") UUID cycleId);

    @Query("SELECT o FROM Objective o WHERE o.isDeleted = false AND o.alignmentParentId = :parentId ORDER BY o.createdAt DESC")
    List<Objective> findByAlignmentParentId(@Param("parentId") UUID parentId);

    @Query("SELECT o FROM Objective o WHERE o.isDeleted = false AND o.status = :status ORDER BY o.createdAt DESC")
    List<Objective> findByStatus(@Param("status") String status);

    @Query("SELECT o FROM Objective o WHERE o.isDeleted = false AND o.managerId = :managerId ORDER BY o.createdAt DESC")
    List<Objective> findByManagerId(@Param("managerId") UUID managerId);

    @Query("SELECT COUNT(o) FROM Objective o WHERE o.isDeleted = false AND o.employeeId = :employeeId AND o.cycleId = :cycleId")
    long countByEmployeeIdAndCycleId(@Param("employeeId") UUID employeeId, @Param("cycleId") UUID cycleId);

    @Query("SELECT o FROM Objective o WHERE o.isDeleted = false AND o.isPrivate = false ORDER BY o.createdAt DESC")
    List<Objective> findPublicObjectives();
}
