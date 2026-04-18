package com.everx.crm.quote;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuoteRepository extends JpaRepository<Quote, UUID> {

    @Query("SELECT q FROM Quote q WHERE q.isDeleted = false AND q.id = :id")
    Optional<Quote> findByIdActive(@Param("id") UUID id);

    @Query("SELECT q FROM Quote q WHERE q.isDeleted = false ORDER BY q.createdAt DESC")
    Page<Quote> findAllActive(Pageable pageable);

    @Query("SELECT q FROM Quote q WHERE q.isDeleted = false AND lower(q.status) = lower(:status) ORDER BY q.createdAt DESC")
    Page<Quote> findByStatus(@Param("status") String status, Pageable pageable);

    @Query("SELECT q FROM Quote q WHERE q.isDeleted = false AND q.quoteNumber = :quoteNumber")
    Quote findByQuoteNumber(@Param("quoteNumber") String quoteNumber);

    @Query("SELECT q FROM Quote q WHERE q.isDeleted = false AND q.dealId = :dealId ORDER BY q.createdAt DESC")
    Page<Quote> findByDealId(@Param("dealId") java.util.UUID dealId, Pageable pageable);
}
