package com.everx.fieldwork.repository;

import com.everx.fieldwork.entity.FieldJobNote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface FieldJobNoteRepository extends JpaRepository<FieldJobNote, UUID>, JpaSpecificationExecutor<FieldJobNote> {

    // Basic CRUD operations with custom queries
    List<FieldJobNote> findByFieldJobId(String fieldJobId);

    List<FieldJobNote> findByCreatedBy(String createdBy);

    // Type-based queries
    List<FieldJobNote> findByType(FieldJobNote.NoteType type);

    List<FieldJobNote> findByTypeIn(List<FieldJobNote.NoteType> types);

    List<FieldJobNote> findByFieldJobIdAndType(String fieldJobId, FieldJobNote.NoteType type);

    // Visibility queries
    List<FieldJobNote> findByVisibility(FieldJobNote.NoteVisibility visibility);

    List<FieldJobNote> findByIsCustomerVisible(boolean isCustomerVisible);

    List<FieldJobNote> findByIsTechnicianVisible(boolean isTechnicianVisible);

    List<FieldJobNote> findByIsManagerVisible(boolean isManagerVisible);

    @Query("SELECT n FROM FieldJobNote n WHERE n.fieldJobId = :fieldJobId " +
           "AND (:isVisibleToCustomer IS NULL OR n.isCustomerVisible = :isVisibleToCustomer) " +
           "ORDER BY n.createdAt DESC")
    List<FieldJobNote> findByFieldJobAndCustomerVisibility(
            @Param("fieldJobId") String fieldJobId,
            @Param("isVisibleToCustomer") Boolean isVisibleToCustomer
    );

    // Time-based queries
    List<FieldJobNote> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<FieldJobNote> findByFieldJobIdAndCreatedAtBetween(
            String fieldJobId, 
            LocalDateTime startDate, 
            LocalDateTime endDate
    );

    @Query("SELECT n FROM FieldJobNote n WHERE n.fieldJobId = :fieldJobId " +
           "AND n.createdAt >= :since " +
           "ORDER BY n.createdAt DESC")
    List<FieldJobNote> findRecentByFieldJob(@Param("fieldJobId") String fieldJobId, @Param("since") LocalDateTime since);

    // Priority queries
    List<FieldJobNote> findByPriority(FieldJobNote.NotePriority priority);

    List<FieldJobNote> findByPriorityIn(List<FieldJobNote.NotePriority> priorities);

    @Query("SELECT n FROM FieldJobNote n WHERE n.priority IN ('HIGH', 'URGENT', 'CRITICAL') " +
           "AND n.followUpRequired = true " +
           "AND n.followUpCompleted = false")
    List<FieldJobNote> findHighPriorityFollowUps();

    // Follow-up queries
    List<FieldJobNote> findByFollowUpRequired(boolean followUpRequired);

    List<FieldJobNote> findByFollowUpCompleted(boolean followUpCompleted);

    @Query("SELECT n FROM FieldJobNote n WHERE n.followUpRequired = true " +
           "AND n.followUpCompleted = false " +
           "AND n.followUpDate <= :currentDate")
    List<FieldJobNote> findOverdueFollowUps(@Param("currentDate") LocalDateTime currentDate);

    @Query("SELECT n FROM FieldJobNote n WHERE n.assignedTo = :userId " +
           "AND n.followUpRequired = true " +
           "AND n.followUpCompleted = false")
    List<FieldJobNote> findFollowUpsByAssignee(@Param("userId") String userId);

    // Status change queries
    List<FieldJobNote> findByIsStatusChangeNote(boolean isStatusChangeNote);

    @Query("SELECT n FROM FieldJobNote n WHERE n.isStatusChangeNote = true " +
           "AND n.fieldJobId = :fieldJobId " +
           "ORDER BY n.createdAt DESC")
    List<FieldJobNote> findStatusChangesByFieldJob(@Param("fieldJobId") String fieldJobId);

    // Communication queries
    @Query("SELECT n FROM FieldJobNote n WHERE n.type IN ('CUSTOMER_COMMUNICATION', 'CUSTOMER_APPROVAL_RECEIVED') " +
           "AND n.fieldJobId = :fieldJobId")
    List<FieldJobNote> findCustomerCommunications(@Param("fieldJobId") String fieldJobId);

    @Query("SELECT n FROM FieldJobNote n WHERE n.notificationSent = true " +
           "AND n.notificationSentAt >= :since")
    List<FieldJobNote> findRecentNotifications(@Param("since") LocalDateTime since);

    // Safety and quality queries
    List<FieldJobNote> findByIsSafetyNote(boolean isSafetyNote);

    List<FieldJobNote> findByIsQualityNote(boolean isQualityNote);

    @Query("SELECT n FROM FieldJobNote n WHERE (n.isSafetyNote = true OR n.isQualityNote = true) " +
           "AND n.requiresSafetyReview = true " +
           "AND n.safetyReviewCompleted = false")
    List<FieldJobNote> findPendingSafetyQualityReviews();

    // Cost and approval queries
    List<FieldJobNote> findByRequiresCustomerApproval(boolean requiresCustomerApproval);

    List<FieldJobNote> findByCustomerApprovalReceived(boolean customerApprovalReceived);

    @Query("SELECT n FROM FieldJobNote n WHERE n.requiresCustomerApproval = true " +
           "AND n.customerApprovalReceived = false")
    List<FieldJobNote> findPendingCustomerApprovals();

    // Response tracking queries
    List<FieldJobNote> findByRequiresResponse(boolean requiresResponse);

    List<FieldJobNote> findByResponseReceived(boolean responseReceived);

    @Query("SELECT n FROM FieldJobNote n WHERE n.requiresResponse = true " +
           "AND n.responseReceived = false " +
           "AND n.responseRequiredBy <= :currentDate")
    List<FieldJobNote> findOverdueResponses(@Param("currentDate") LocalDateTime currentDate);

    // Escalation queries
    List<FieldJobNote> findByIsEscalated(boolean isEscalated);

    @Query("SELECT n FROM FieldJobNote n WHERE n.isEscalated = true " +
           "ORDER BY n.escalatedAt DESC")
    List<FieldJobNote> findEscalatedNotes(Pageable pageable);

    // Search queries
    @Query("SELECT n FROM FieldJobNote n WHERE " +
           "LOWER(n.noteText) LIKE %:searchTerm% " +
           "OR LOWER(n.createdByName) LIKE %:searchTerm% " +
           "OR LOWER(n.category) LIKE %:searchTerm% " +
           "OR LOWER(n.tags) LIKE %:searchTerm%")
    List<FieldJobNote> findBySearchTerm(@Param("searchTerm") String searchTerm);

    @Query("SELECT n FROM FieldJobNote n WHERE n.fieldJobId = :fieldJobId " +
           "AND (LOWER(n.noteText) LIKE %:searchTerm% OR " +
           "LOWER(n.createdByName) LIKE %:searchTerm%) " +
           "ORDER BY n.createdAt DESC")
    List<FieldJobNote> findByFieldJobAndSearchTerm(
            @Param("fieldJobId") String fieldJobId,
            @Param("searchTerm") String searchTerm
    );

    // Attachment queries
    @Query("SELECT n FROM FieldJobNote n WHERE " +
           "(n.attachmentUrls IS NOT NULL OR n.photoUrls IS NOT NULL OR " +
           "n.videoUrls IS NOT NULL OR n.documentUrls IS NOT NULL)")
    List<FieldJobNote> findNotesWithAttachments();

    @Query("SELECT n FROM FieldJobNote n WHERE n.fieldJobId = :fieldJobId " +
           "AND (n.photoUrls IS NOT NULL OR n.videoUrls IS NOT NULL)")
    List<FieldJobNote> findNotesWithMedia(@Param("fieldJobId") String fieldJobId);

    // Location-based queries
    @Query("SELECT n FROM FieldJobNote n WHERE n.latitude IS NOT NULL " +
           "AND n.longitude IS NOT NULL " +
           "AND n.createdAt >= :since")
    List<FieldJobNote> findNotesWithLocation(@Param("since") LocalDateTime since);

    // Integration queries
    List<FieldJobNote> findByErpReference(String erpReference);

    List<FieldJobNote> findByCrmReference(String crmReference);

    List<FieldJobNote> findByExternalReference(String externalReference);

    // Category and tag queries
    List<FieldJobNote> findByCategory(String category);

    List<FieldJobNote> findBySubcategory(String subcategory);

    @Query("SELECT n FROM FieldJobNote n WHERE n.tags LIKE %:tag%")
    List<FieldJobNote> findByTag(@Param("tag") String tag);

    // Version and edit queries
    List<FieldJobNote> findByIsEdited(boolean isEdited);

    @Query("SELECT n FROM FieldJobNote n WHERE n.parentNoteId = :parentNoteId " +
           "ORDER BY n.createdAt ASC")
    List<FieldJobNote> findReplies(@Param("parentNoteId") String parentNoteId);

    // Dashboard and statistics queries
    @Query("SELECT COUNT(n) FROM FieldJobNote n WHERE n.fieldJobId = :fieldJobId")
    long countByFieldJob(@Param("fieldJobId") String fieldJobId);

    @Query("SELECT COUNT(n) FROM FieldJobNote n WHERE n.createdBy = :userId " +
           "AND n.createdAt >= :since")
    long countByUserSince(@Param("userId") String userId, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(n) FROM FieldJobNote n WHERE n.type = :type " +
           "AND n.createdAt >= :since")
    long countByTypeSince(@Param("type") FieldJobNote.NoteType type, @Param("since") LocalDateTime since);

    // Performance metrics queries
    @Query("SELECT n.type, COUNT(n) FROM FieldJobNote n " +
           "WHERE n.createdAt >= :since " +
           "GROUP BY n.type")
    List<Object[]> getNoteTypeStats(@Param("since") LocalDateTime since);

    @Query("SELECT n.priority, COUNT(n) FROM FieldJobNote n " +
           "WHERE n.createdAt >= :since " +
           "GROUP BY n.priority")
    List<Object[]> getNotePriorityStats(@Param("since") LocalDateTime since);

    // Response time queries
    @Query("SELECT AVG(EXTRACT(EPOCH FROM (n.responseReceivedAt - n.createdAt))) " +
           "FROM FieldJobNote n WHERE n.requiresResponse = true " +
           "AND n.responseReceived = true " +
           "AND n.createdAt >= :since")
    Double getAverageResponseTime(@Param("since") LocalDateTime since);

    // Follow-up performance queries
    @Query("SELECT COUNT(n) FROM FieldJobNote n WHERE n.followUpRequired = true " +
           "AND n.followUpCompleted = true " +
           "AND n.followUpCompletedAt <= n.followUpDate " +
           "AND n.createdAt >= :since")
    long countOnTimeFollowUps(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(n) FROM FieldJobNote n WHERE n.followUpRequired = true " +
           "AND n.createdAt >= :since")
    long countTotalFollowUps(@Param("since") LocalDateTime since);

    // Escalation metrics
    @Query("SELECT n.escalatedTo, COUNT(n) FROM FieldJobNote n " +
           "WHERE n.isEscalated = true " +
           "AND n.escalatedAt >= :since " +
           "GROUP BY n.escalatedTo")
    List<Object[]> getEscalationStats(@Param("since") LocalDateTime since);

    // Customer communication metrics
    @Query("SELECT COUNT(n) FROM FieldJobNote n WHERE n.isCustomerVisible = true " +
           "AND n.createdAt >= :since")
    long countCustomerVisibleNotes(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(n) FROM FieldJobNote n WHERE n.type = 'CUSTOMER_COMMUNICATION' " +
           "AND n.createdAt >= :since")
    long countCustomerCommunications(@Param("since") LocalDateTime since);

    // Quality and safety metrics
    @Query("SELECT COUNT(n) FROM FieldJobNote n WHERE (n.isSafetyNote = true OR n.isQualityNote = true) " +
           "AND n.createdAt >= :since")
    long countSafetyQualityNotes(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(n) FROM FieldJobNote n WHERE n.requiresSafetyReview = true " +
           "AND n.safetyReviewCompleted = false " +
           "AND n.createdAt >= :since")
    long countPendingSafetyReviews(@Param("since") LocalDateTime since);

    // Approval workflow metrics
    @Query("SELECT COUNT(n) FROM FieldJobNote n WHERE n.requiresCustomerApproval = true " +
           "AND n.customerApprovalReceived = true " +
           "AND n.createdAt >= :since")
    long countCustomerApprovalsReceived(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(n) FROM FieldJobNote n WHERE n.requiresCustomerApproval = true " +
           "AND n.customerApprovalReceived = false " +
           "AND n.createdAt >= :since")
    long countCustomerApprovalsPending(@Param("since") LocalDateTime since);

    // Notification metrics
    @Query("SELECT n.notificationMethod, COUNT(n) FROM FieldJobNote n " +
           "WHERE n.notificationSent = true " +
           "AND n.notificationSentAt >= :since " +
           "GROUP BY n.notificationMethod")
    List<Object[]> getNotificationMethodStats(@Param("since") LocalDateTime since);

    // Advanced filtering queries
    @Query("SELECT n FROM FieldJobNote n WHERE " +
           "(:fieldJobId IS NULL OR n.fieldJobId = :fieldJobId) " +
           "AND (:type IS NULL OR n.type = :type) " +
           "AND (:priority IS NULL OR n.priority = :priority) " +
           "AND (:createdBy IS NULL OR n.createdBy = :createdBy) " +
           "AND (:startDate IS NULL OR n.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR n.createdAt <= :endDate) " +
           "ORDER BY n.createdAt DESC")
    List<FieldJobNote> findByAdvancedFilters(
            @Param("fieldJobId") String fieldJobId,
            @Param("type") FieldJobNote.NoteType type,
            @Param("priority") FieldJobNote.NotePriority priority,
            @Param("createdBy") String createdBy,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Cleanup queries
    @Query("SELECT n FROM FieldJobNote n WHERE n.createdAt < :cutoff " +
           "AND n.type IN ('GENERAL', 'STATUS_UPDATE') " +
           "AND n.priority = 'LOW'")
    List<FieldJobNote> findOldLowPriorityNotes(@Param("cutoff") LocalDateTime cutoff);

    // Recent activity queries
    @Query("SELECT n FROM FieldJobNote n WHERE n.createdAt >= :since " +
           "ORDER BY n.createdAt DESC")
    List<FieldJobNote> findRecentActivity(@Param("since") LocalDateTime since, Pageable pageable);

    @Query("SELECT n FROM FieldJobNote n WHERE n.fieldJobId IN :fieldJobIds " +
           "AND n.createdAt >= :since " +
           "ORDER BY n.createdAt DESC")
    List<FieldJobNote> findRecentActivityByJobs(
            @Param("fieldJobIds") List<String> fieldJobIds,
            @Param("since") LocalDateTime since,
            Pageable pageable
    );
}
