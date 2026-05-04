package com.everx.crm.quote;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface QuoteConversionRepository extends JpaRepository<QuoteConversion, UUID> {

    Optional<QuoteConversion> findByQuoteIdAndIsDeletedFalse(UUID quoteId);
}
