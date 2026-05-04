package com.everx.finance.journal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface GlJournalEntryRepository extends JpaRepository<GlJournalEntry, UUID> {
}
