package com.everx.erp.fieldwork;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FieldJobChecklistRepository extends JpaRepository<FieldJobChecklist, Long> {
    Optional<FieldJobChecklist> findByFieldJob_Id(UUID fieldJobId);
}