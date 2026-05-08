package com.everx.collaboration.repository;

import com.everx.collaboration.entity.CollaborationUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface CollaborationUserRepository extends JpaRepository<CollaborationUser, UUID> {
}
