package com.everx.platform.config.repository;

import com.everx.platform.config.entity.OptionSet;
import com.everx.platform.config.entity.OptionValue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OptionValueRepository extends JpaRepository<OptionValue, UUID> {

    List<OptionValue> findByOptionSetAndIsDeletedFalseOrderBySortOrderAsc(OptionSet optionSet);

    List<OptionValue> findByOptionSetAndIsActiveTrueAndIsDeletedFalseOrderBySortOrderAsc(OptionSet optionSet);

    boolean existsByOptionSetAndValueIgnoreCaseAndIsActiveTrueAndIsDeletedFalse(OptionSet optionSet, String value);
}
