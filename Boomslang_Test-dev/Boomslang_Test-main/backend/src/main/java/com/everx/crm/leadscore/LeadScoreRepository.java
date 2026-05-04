package com.everx.crm.leadscore;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface LeadScoreRepository extends JpaRepository<LeadScore, UUID> {

    @Query("SELECT COALESCE(SUM(ls.points), 0) FROM LeadScore ls WHERE ls.isDeleted = false AND ls.leadId = :leadId")
    Integer sumPointsByLeadId(@Param("leadId") UUID leadId);
}
