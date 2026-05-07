package com.everx.platform.config.repository;

import com.everx.platform.config.entity.LayoutConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LayoutConfigRepository extends JpaRepository<LayoutConfig, UUID> {

    List<LayoutConfig> findByModuleAndEntityAndIsDeletedFalseOrderByNameAsc(String module, String entity);

    Optional<LayoutConfig> findByModuleAndEntityAndIsDefaultTrueAndIsDeletedFalse(String module, String entity);

        List<LayoutConfig> findByModuleAndEntityAndStatusAndIsActiveTrueAndIsDeletedFalseOrderByVersionNumberDesc(
            String module, String entity, String status);

        List<LayoutConfig> findByModuleAndEntityAndIsDefaultTrueAndStatusAndIsActiveTrueAndIsDeletedFalseOrderByVersionNumberDesc(
            String module, String entity, String status);
}
