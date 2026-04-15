package com.everx.shared.scheduler;

import com.everx.erp.equipment.Equipment;
import com.everx.erp.equipment.EquipmentRepository;
import com.everx.erp.service.ServiceTicket;
import com.everx.erp.service.ServiceTicketRepository;
import com.everx.erp.service.ServicePriority;
import com.everx.erp.service.ServiceStatus;
import com.everx.erp.service.ServiceType;
import com.everx.erp.warranty.Warranty;
import com.everx.erp.warranty.WarrantyRepository;
import com.everx.shared.service.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class AlertScheduler {

    private final WarrantyRepository warrantyRepository;
    private final EquipmentRepository equipmentRepository;
    private final ServiceTicketRepository serviceTicketRepository;
    private final MailService mailService;

    /**
     * Daily at 8 AM: Check for warranty expiries.
     */
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void checkWarrantyExpiries() {
        log.info("Checking for warranty expiries...");
        LocalDate today = LocalDate.now();
        
        // Alert at 30, 7, and 1 day remaining
        checkAndNotify(today.plusDays(30), "30 days");
        checkAndNotify(today.plusDays(7), "7 days");
        checkAndNotify(today.plusDays(1), "1 day");
    }

    private void checkAndNotify(LocalDate expiryDate, String remainingTime) {
        List<Warranty> expiring = warrantyRepository.findByEndDate(expiryDate);
        for (Warranty w : expiring) {
            String message = String.format(
                "Warranty for Equipment %s is expiring in %s (Date: %s).",
                w.getEquipmentId(), remainingTime, w.getEndDate()
            );
            // In a real system, we'd find the account manager's email
            mailService.sendSimpleMessage("sales@everx.com", "Warranty Expiry Alert: " + w.getEquipmentId(), message);
        }
    }

    /**
     * Daily at 9 AM: Check for annual safety checks.
     * If due date is within 7 days, create a service ticket automatically.
     */
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional
    public void checkSafetyChecks() {
        log.info("Checking for annual safety checks...");
        LocalDate nextWeek = LocalDate.now().plusDays(7);
        
        // Find equipment where safety check is due (Implementation details for safety check date needed)
        // For demonstration, we assume Equipment has a field or we use acquisition_date + 1 year
        List<Equipment> allEquipment = equipmentRepository.findAll();
        for (Equipment e : allEquipment) {
            // Placeholder: every year from created_at
            LocalDate due = e.getCreatedAt().toLocalDate().plusYears(1);
            if (due.isEqual(nextWeek)) {
                createSafetyCheckTicket(e);
            }
        }
    }

    private void createSafetyCheckTicket(Equipment e) {
        // Check if ticket already exists for this period
        boolean exists = serviceTicketRepository.findAll().stream()
                .anyMatch(t -> t.getEquipmentId().equals(e.getId()) 
                               && t.getType() == ServiceType.OTHER // Standardize later or add ANNUAL_SAFETY_CHECK to Enum
                               && t.getStatus() != ServiceStatus.CLOSED);
        
        if (!exists) {
            ServiceTicket ticket = new ServiceTicket();
            ticket.setTicketNumber("SC-" + e.getInternalCode() + "-" + LocalDate.now().getYear());
            ticket.setEquipmentId(e.getId());
            
            // Link to the account associated with the equipment's current warranty if possible
            UUID accountId = warrantyRepository.findAll().stream()
                .filter(w -> w.getEquipmentId().equals(e.getId()))
                .map(Warranty::getAccountId)
                .findFirst()
                .orElse(e.getId()); // Fallback to satisfy not-null if no warranty found
                
            ticket.setAccountId(accountId);
            ticket.setType(ServiceType.CORRECTIVE_MAINTENANCE); // Or add SAFETY_CHECK
            ticket.setStatus(ServiceStatus.OPEN);
            ticket.setPriority(ServicePriority.MEDIUM);
            ticket.setReportedDate(LocalDate.now());
            ticket.setDescription("Automated annual safety check reminder for " + e.getMake() + " " + e.getModel());
            
            serviceTicketRepository.save(ticket);
            log.info("Created automated safety check ticket for: {}", e.getInternalCode());
        }
    }
}
