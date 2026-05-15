package com.everx.crm.quote;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface QuoteLineItemRepository extends JpaRepository<QuoteLineItem, UUID> {
}
