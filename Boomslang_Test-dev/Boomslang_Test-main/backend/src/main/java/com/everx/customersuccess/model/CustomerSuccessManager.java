package com.everx.customersuccess.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "customer_success_managers")
public class CustomerSuccessManager {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    private String phone;
    
    private String department;
    
    private String role;
    
    private String status;
    
    private Integer assignedCustomers;
    
    private Integer satisfactionScore;
    
    private Integer responseRate;
    
    @ElementCollection
    @CollectionTable(name = "csm_skills", joinColumns = @JoinColumn(name = "manager_id"))
    @Column(name = "skill")
    private List<String> skills;
    
    @ElementCollection
    @CollectionTable(name = "csm_certifications", joinColumns = @JoinColumn(name = "manager_id"))
    @Column(name = "certification")
    private List<String> certifications;
    
    private LocalDateTime hireDate;
    
    private LocalDateTime lastActive;
    
    private String timezone;
    
    private String avatar;
    
    @Column(nullable = false)
    private Boolean isActive;
    
    @Lob
    private String notes;
    
    @OneToMany(mappedBy = "managerId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CustomerEngagement> engagements;
    
    @OneToMany(mappedBy = "managerId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CustomerHealthScore> healthScores;
    
    // Constructors
    public CustomerSuccessManager() {}
    
    public CustomerSuccessManager(String firstName, String lastName, String email) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.isActive = true;
        this.hireDate = LocalDateTime.now();
        this.lastActive = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getDepartment() {
        return department;
    }
    
    public void setDepartment(String department) {
        this.department = department;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Integer getAssignedCustomers() {
        return assignedCustomers;
    }
    
    public void setAssignedCustomers(Integer assignedCustomers) {
        this.assignedCustomers = assignedCustomers;
    }
    
    public Integer getSatisfactionScore() {
        return satisfactionScore;
    }
    
    public void setSatisfactionScore(Integer satisfactionScore) {
        this.satisfactionScore = satisfactionScore;
    }
    
    public Integer getResponseRate() {
        return responseRate;
    }
    
    public void setResponseRate(Integer responseRate) {
        this.responseRate = responseRate;
    }
    
    public List<String> getSkills() {
        return skills;
    }
    
    public void setSkills(List<String> skills) {
        this.skills = skills;
    }
    
    public List<String> getCertifications() {
        return certifications;
    }
    
    public void setCertifications(List<String> certifications) {
        this.certifications = certifications;
    }
    
    public LocalDateTime getHireDate() {
        return hireDate;
    }
    
    public void setHireDate(LocalDateTime hireDate) {
        this.hireDate = hireDate;
    }
    
    public LocalDateTime getLastActive() {
        return lastActive;
    }
    
    public void setLastActive(LocalDateTime lastActive) {
        this.lastActive = lastActive;
    }
    
    public String getTimezone() {
        return timezone;
    }
    
    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }
    
    public String getAvatar() {
        return avatar;
    }
    
    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public List<CustomerEngagement> getEngagements() {
        return engagements;
    }
    
    public void setEngagements(List<CustomerEngagement> engagements) {
        this.engagements = engagements;
    }
    
    public List<CustomerHealthScore> getHealthScores() {
        return healthScores;
    }
    
    public void setHealthScores(List<CustomerHealthScore> healthScores) {
        this.healthScores = healthScores;
    }
    
    // Utility method to get full name
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.lastActive = LocalDateTime.now();
    }
}
