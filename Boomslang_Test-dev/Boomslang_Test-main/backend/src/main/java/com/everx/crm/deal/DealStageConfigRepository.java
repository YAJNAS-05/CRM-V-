package com.everx.crm.deal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DealStageConfigRepository extends JpaRepository<DealStageConfig, UUID> {

    Optional<DealStageConfig> findByStageNameAndIsDeletedFalse(String stageName);

    List<DealStageConfig> findByIsActiveTrueAndIsDeletedFalseOrderByStageOrderAsc();
}
