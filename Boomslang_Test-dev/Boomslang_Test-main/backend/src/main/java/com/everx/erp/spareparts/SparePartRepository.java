package com.everx.erp.spareparts;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface SparePartRepository extends JpaRepository<SparePart, UUID> {
}
