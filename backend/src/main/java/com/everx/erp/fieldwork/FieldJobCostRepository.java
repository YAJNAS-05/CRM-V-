package com.everx.erp.fieldwork;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FieldJobCostRepository extends JpaRepository<FieldJobCost, Long> {
    List<FieldJobCost> findByFieldJobIdOrderByPostingDateAsc(Long fieldJobId);
    List<FieldJobCost> findByFieldJob_IdOrderByPostingDateAsc(java.util.UUID fieldJobId);
    Optional<FieldJobCost> findByCostIdAndFieldJob_Id(Long costId, java.util.UUID fieldJobId);
}