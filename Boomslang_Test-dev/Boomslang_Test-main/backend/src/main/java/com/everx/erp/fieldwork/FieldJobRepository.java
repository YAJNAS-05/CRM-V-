package com.everx.erp.fieldwork;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface FieldJobRepository extends JpaRepository<FieldJob, UUID> {
}
