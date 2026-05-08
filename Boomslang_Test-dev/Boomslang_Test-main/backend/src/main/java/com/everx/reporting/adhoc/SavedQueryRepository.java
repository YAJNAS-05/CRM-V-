package com.everx.reporting.adhoc;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SavedQueryRepository extends JpaRepository<SavedQuery, UUID> {

    List<SavedQuery> findByUserIdOrderByCreatedAtDesc(String userId);

    List<SavedQuery> findByUserIdAndNameContainingIgnoreCase(String userId, String name);
}
