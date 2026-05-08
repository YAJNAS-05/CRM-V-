package com.everx.fieldwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FieldJobSearchRequest {
    
    private String jobNumber;
    
    private String title;
    
    private String customerName;
    
    private String status;
    
    private String priority;
    
    private String assignedTechnicianId;
    
    private LocalDateTime startDate;
    
    private LocalDateTime endDate;
    
    private String category;
    
    private String paymentStatus;
    
    private Boolean requiresParts;
    
    private Boolean requiresSpecialEquipment;
    
    private String complexity;
    
    private String erpAssetId;
    
    private String erpWorkOrderId;
    
    private String crmLeadId;
    
    private String crmAccountId;
}
