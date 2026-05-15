package com.everx.erp.fieldwork;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FieldJobTravelRepository extends JpaRepository<FieldJobTravel, Long> {
    List<FieldJobTravel> findByFieldJob_IdOrderByLegNumberAsc(UUID fieldJobId);
}