package com.everx.erp.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ServiceTicketRepository extends JpaRepository<ServiceTicket, UUID> {

    @Query("SELECT s FROM ServiceTicket s WHERE s.isDeleted = false AND s.id = :id")
    Optional<ServiceTicket> findByIdAndNotDeleted(@Param("id") UUID id);

    @Query("SELECT s FROM ServiceTicket s WHERE s.isDeleted = false")
    Page<ServiceTicket> findAllNotDeleted(Pageable pageable);

    @Query("SELECT s FROM ServiceTicket s WHERE s.isDeleted = false AND s.ticketNumber = :ticketNumber")
    Optional<ServiceTicket> findByTicketNumber(@Param("ticketNumber") String ticketNumber);

    @Query("SELECT t FROM ServiceTicket t WHERE t.isDeleted = false AND t.status = :status")
    Page<ServiceTicket> findByStatus(@Param("status") ServiceStatus status, Pageable pageable);

    @Query("SELECT t FROM ServiceTicket t WHERE t.isDeleted = false AND t.priority = :priority")
    Page<ServiceTicket> findByPriority(@Param("priority") ServicePriority priority, Pageable pageable);

    @Query("SELECT s FROM ServiceTicket s WHERE s.isDeleted = false AND s.assignedTo = :userId")
    Page<ServiceTicket> findByAssignedTo(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT s FROM ServiceTicket s WHERE s.isDeleted = false AND s.status = 'OPEN' ORDER BY s.priority DESC, s.reportedDate ASC")
    List<ServiceTicket> findOpenTickets();
}
