package com.everx.collaboration.repository;

import com.everx.collaboration.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {
    
    Optional<Document> findByDocumentId(String documentId);
    
    List<Document> findByOwnerId(String ownerId);
    
    List<Document> findByStatus(String status);
    
    @Query("SELECT d FROM Document d WHERE d.status = 'ACTIVE' ORDER BY d.updatedAt DESC")
    List<Document> findActiveDocuments();
    
    @Query("SELECT d FROM Document d WHERE d.collaborative = true")
    List<Document> findCollaborativeDocuments();
    
    List<Document> findByOwnerIdAndStatus(String ownerId, String status);
}
