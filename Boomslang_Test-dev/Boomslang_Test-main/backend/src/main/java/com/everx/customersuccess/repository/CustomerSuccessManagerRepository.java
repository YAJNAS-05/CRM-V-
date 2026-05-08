package com.everx.customersuccess.repository;

import com.everx.customersuccess.model.CustomerSuccessManager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerSuccessManagerRepository extends JpaRepository<CustomerSuccessManager, Long> {
    
    Optional<CustomerSuccessManager> findByEmail(String email);
    
    List<CustomerSuccessManager> findByDepartment(String department);
    
    List<CustomerSuccessManager> findByStatus(String status);
    
    List<CustomerSuccessManager> findByIsActiveTrue();
    
    @Query("SELECT csm FROM CustomerSuccessManager csm WHERE csm.assignedCustomers > :threshold")
    List<CustomerSuccessManager> findManagersWithMoreCustomersThan(@Param("threshold") Integer threshold);
    
    @Query("SELECT csm FROM CustomerSuccessManager csm WHERE csm.satisfactionScore >= :minScore")
    List<CustomerSuccessManager> findManagersByMinSatisfactionScore(@Param("minScore") Integer minScore);
    
    @Query("SELECT COUNT(csm) FROM CustomerSuccessManager csm WHERE csm.isActive = true")
    Long countActiveManagers();
    
    @Query("SELECT AVG(csm.satisfactionScore) FROM CustomerSuccessManager csm WHERE csm.isActive = true")
    Double getAverageSatisfactionScore();
    
    @Query("SELECT csm FROM CustomerSuccessManager csm JOIN csm.skills skill WHERE skill = :skill")
    List<CustomerSuccessManager> findManagersBySkill(@Param("skill") String skill);
    
    @Query("SELECT csm FROM CustomerSuccessManager csm WHERE csm.lastActive < :date")
    List<CustomerSuccessManager> findInactiveManagersSince(@Param("date") java.time.LocalDateTime date);
}
