package com.everx.customersuccess.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "customer_engagements")
public class CustomerEngagement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id", nullable = false)
    private CustomerSuccessManager manager;
    
    @Column(nullable = false)
    private String engagementType;
    
    @Column(nullable = false)
    private String title;
    
    @Lob
    private String description;
    
    private LocalDateTime scheduledDate;
    
    private LocalDateTime completedDate;
    
    @Column(nullable = false)
    private String status;
    
    private String priority;
    
    private Integer duration;
    
    private String outcome;
    
    private Integer satisfactionRating;
    
    @ElementCollection
    @CollectionTable(name = "engagement_participants", joinColumns = @JoinColumn(name = "engagement_id"))
    @Column(name = "participant")
    private List<String> participants;
    
    @ElementCollection
    @CollectionTable(name = "engagement_tags", joinColumns = @JoinColumn(name = "engagement_id"))
    @Column(name = "tag")
    private List<String> tags;
    
    private String location;
    
    @Column(nullable = false)
    private Boolean isVirtual;
    
    private String meetingLink;
    
    @Lob
    private String notes;
    
    private LocalDateTime followUpDate;
    
    private String nextAction;
    
    @ElementCollection
    @CollectionTable(name = "engagement_attachments", joinColumns = @JoinColumn(name = "engagement_id"))
    @Column(name = "attachment")
    private List<String> attachments;
    
    private String createdBy;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Constructors
    public CustomerEngagement() {}
    
    public CustomerEngagement(Customer customer, CustomerSuccessManager manager, String engagementType, String title) {
        this.customer = customer;
        this.manager = manager;
        this.engagementType = engagementType;
        this.title = title;
        this.status = "SCHEDULED";
        this.isVirtual = false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Customer getCustomer() {
        return customer;
    }
    
    public void setCustomer(Customer customer) {
        this.customer = customer;
    }
    
    public CustomerSuccessManager getManager() {
        return manager;
    }
    
    public void setManager(CustomerSuccessManager manager) {
        this.manager = manager;
    }
    
    public String getEngagementType() {
        return engagementType;
    }
    
    public void setEngagementType(String engagementType) {
        this.engagementType = engagementType;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public LocalDateTime getScheduledDate() {
        return scheduledDate;
    }
    
    public void setScheduledDate(LocalDateTime scheduledDate) {
        this.scheduledDate = scheduledDate;
    }
    
    public LocalDateTime getCompletedDate() {
        return completedDate;
    }
    
    public void setCompletedDate(LocalDateTime completedDate) {
        this.completedDate = completedDate;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getPriority() {
        return priority;
    }
    
    public void setPriority(String priority) {
        this.priority = priority;
    }
    
    public Integer getDuration() {
        return duration;
    }
    
    public void setDuration(Integer duration) {
        this.duration = duration;
    }
    
    public String getOutcome() {
        return outcome;
    }
    
    public void setOutcome(String outcome) {
        this.outcome = outcome;
    }
    
    public Integer getSatisfactionRating() {
        return satisfactionRating;
    }
    
    public void setSatisfactionRating(Integer satisfactionRating) {
        this.satisfactionRating = satisfactionRating;
    }
    
    public List<String> getParticipants() {
        return participants;
    }
    
    public void setParticipants(List<String> participants) {
        this.participants = participants;
    }
    
    public List<String> getTags() {
        return tags;
    }
    
    public void setTags(List<String> tags) {
        this.tags = tags;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public Boolean getIsVirtual() {
        return isVirtual;
    }
    
    public void setIsVirtual(Boolean isVirtual) {
        this.isVirtual = isVirtual;
    }
    
    public String getMeetingLink() {
        return meetingLink;
    }
    
    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public LocalDateTime getFollowUpDate() {
        return followUpDate;
    }
    
    public void setFollowUpDate(LocalDateTime followUpDate) {
        this.followUpDate = followUpDate;
    }
    
    public String getNextAction() {
        return nextAction;
    }
    
    public void setNextAction(String nextAction) {
        this.nextAction = nextAction;
    }
    
    public List<String> getAttachments() {
        return attachments;
    }
    
    public void setAttachments(List<String> attachments) {
        this.attachments = attachments;
    }
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
