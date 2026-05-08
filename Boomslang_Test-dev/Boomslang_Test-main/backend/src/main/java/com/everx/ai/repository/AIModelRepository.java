package com.everx.ai.repository;

import com.everx.ai.entity.AIModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface AIModelRepository extends JpaRepository<AIModel, UUID> {
    List<AIModel> findByModelType(String modelType);
    List<AIModel> findByIsActiveTrue();
}
