package com.everx.finance.journal.repository;

import com.everx.finance.journal.entity.JournalEntryLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Repository for Journal Entry Lines
 */
@Repository
public interface JournalEntryLineRepository extends JpaRepository<JournalEntryLine, UUID> {
}
