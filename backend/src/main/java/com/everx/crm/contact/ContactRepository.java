package com.everx.crm.contact;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContactRepository extends JpaRepository<Contact, UUID> {

    @Query("SELECT c FROM Contact c WHERE c.isDeleted = false AND c.id = :id")
    Optional<Contact> findByIdActive(@Param("id") UUID id);

    @Query("SELECT c FROM Contact c WHERE c.isDeleted = false ORDER BY c.createdAt DESC")
    Page<Contact> findAllActive(Pageable pageable);

    @Query("SELECT c FROM Contact c WHERE c.isDeleted = false AND c.accountId = :accountId ORDER BY c.createdAt DESC")
    Page<Contact> findByAccountId(@Param("accountId") UUID accountId, Pageable pageable);

        @Query("""
                        SELECT c FROM Contact c
                        WHERE c.isDeleted = false
                            AND (
                                     lower(concat(c.firstName, ' ', c.lastName)) LIKE lower(concat('%', :query, '%'))
                                OR lower(c.email) LIKE lower(concat('%', :query, '%'))
                                OR lower(c.phone) LIKE lower(concat('%', :query, '%'))
                                OR lower(c.jobTitle) LIKE lower(concat('%', :query, '%'))
                            )
                        ORDER BY c.createdAt DESC
                        """)
        Page<Contact> search(@Param("query") String query, Pageable pageable);

    @Query("SELECT c FROM Contact c WHERE c.isDeleted = false AND lower(c.email) = lower(:email)")
    Contact findByEmailIgnoreCase(@Param("email") String email);

    long countByOwnerIdAndIsDeletedFalse(UUID ownerId);
}
