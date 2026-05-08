package com.everx.collaboration.repository;

import com.everx.collaboration.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    
    List<Message> findBySessionIdOrderByTimestampAsc(UUID sessionId);
    
    List<Message> findBySenderId(String senderId);
    
    @Query("SELECT m FROM Message m WHERE m.sessionId = :sessionId AND m.timestamp >= :since")
    List<Message> findMessagesSince(@Param("sessionId") UUID sessionId, @Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE m.sessionId = :sessionId")
    long countMessagesInSession(@Param("sessionId") UUID sessionId);
    
    List<Message> findBySessionIdAndTypeOrderByTimestampAsc(UUID sessionId, String type);
}
