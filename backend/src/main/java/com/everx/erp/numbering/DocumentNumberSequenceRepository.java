package com.everx.erp.numbering;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface DocumentNumberSequenceRepository extends JpaRepository<DocumentNumberSequence, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM DocumentNumberSequence s WHERE s.prefix = :prefix")
    Optional<DocumentNumberSequence> findByPrefixForUpdate(@Param("prefix") String prefix);
}
