package com.everx.erp.settings;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NumberingPatternRepository extends JpaRepository<NumberingPattern, Long> {
    Optional<NumberingPattern> findByDocumentType(String documentType);
}
