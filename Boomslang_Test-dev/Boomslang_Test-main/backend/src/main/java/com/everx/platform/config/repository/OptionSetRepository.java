package com.everx.platform.config.repository;

import com.everx.platform.config.entity.OptionSet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OptionSetRepository extends JpaRepository<OptionSet, UUID> {

    Optional<OptionSet> findByModuleAndEntityAndFieldNameAndIsDeletedFalse(
            String module, String entity, String fieldName);

    List<OptionSet> findByModuleAndIsDeletedFalseOrderByNameAsc(String module);

    List<OptionSet> findByIsActiveTrueAndIsDeletedFalseOrderByNameAsc();
}
