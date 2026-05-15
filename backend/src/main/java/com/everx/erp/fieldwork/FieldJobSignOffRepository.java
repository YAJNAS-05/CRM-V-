package com.everx.erp.fieldwork;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FieldJobSignOffRepository extends JpaRepository<FieldJobSignOff, Long> {
    Optional<FieldJobSignOff> findByFieldJob_Id(UUID fieldJobId);
}