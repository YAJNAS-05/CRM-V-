package com.everx.finance.repository;

import com.everx.finance.entity.GlRevaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GlRevaluationRepository extends JpaRepository<GlRevaluation, Long> {
    List<GlRevaluation> findByAccountIdOrderByRevaluationDateDesc(Long accountId);

    List<GlRevaluation> findByRevaluationDateBetween(LocalDate startDate, LocalDate endDate);

    List<GlRevaluation> findByRevaluationDate(LocalDate revaluationDate);
}
