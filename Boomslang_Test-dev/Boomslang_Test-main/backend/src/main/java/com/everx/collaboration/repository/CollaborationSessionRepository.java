package com.everx.collaboration.repository;

import com.everx.collaboration.entity.CollaborationSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CollaborationSessionRepository extends JpaRepository<CollaborationSession, UUID> {
    
    List<CollaborationSession> findByOwnerId(String ownerId);
    
    List<CollaborationSession> findByStatus(String status);
    
    Optional<CollaborationSession> findByDocumentId(String documentId);
    
    @Query("SELECT cs FROM CollaborationSession cs WHERE cs.status = 'ACTIVE' AND cs.id = :sessionId")
    Optional<CollaborationSession> findActiveSession(@Param("sessionId") UUID sessionId);
    
    List<CollaborationSession> findByOwnerIdAndStatus(String ownerId, String status);
}
