package com.everx.shared.scheduler;

import com.everx.erp.equipment.Equipment;
import com.everx.erp.equipment.EquipmentRepository;
import com.everx.erp.fieldwork.FieldJob;
import com.everx.erp.fieldwork.FieldJobRepository;
import com.everx.erp.fieldwork.FieldJobStatus;
import com.everx.erp.fieldwork.FieldJobType;
import com.everx.erp.fieldwork.JobPriority;
import com.everx.erp.warranty.Warranty;
import com.everx.erp.warranty.WarrantyRepository;
import com.everx.shared.service.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
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
    private final FieldJobRepository fieldJobRepository;
    private final MailService mailService;

    /**
     * Daily at 8 AM: Check for warranty expiries.
     */
    @Scheduled(cron = "0 0 8 * * *")
    @SchedulerLock(name = "alertWarrantyExpiries", lockAtMostFor = "55m", lockAtLeastFor = "5m")
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
    @SchedulerLock(name = "alertSafetyChecks", lockAtMostFor = "55m", lockAtLeastFor = "5m")
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
        boolean exists = fieldJobRepository.findOpenJobs().stream()
                .anyMatch(job -> e.getId().equals(job.getEquipmentId())
                        && job.getJobType() == FieldJobType.PPM);

        if (!exists) {
            FieldJob job = new FieldJob();
            job.setJobNumber("FJ-SAFE-" + e.getInternalCode() + "-" + LocalDate.now().getYear());
            job.setJobType(FieldJobType.PPM);
            job.setJobStatus(FieldJobStatus.SCHEDULED);
            job.setPriority(JobPriority.ROUTINE);
            job.setEquipmentId(e.getId());

            UUID accountId = warrantyRepository.findAll().stream()
                    .filter(w -> w.getEquipmentId().equals(e.getId()))
                    .map(Warranty::getAccountId)
                    .findFirst()
                    .orElse(null);
            job.setAccountId(accountId);

            job.setClientOrSellerName("Safety Check");
            job.setSiteContactName("Service Desk");
            job.setSiteContactEmail("service@everx.com");
            job.setSiteAddressLine1(e.getWarehouseLocation() != null ? e.getWarehouseLocation() : "On Site");
            job.setSiteCity(e.getLocationCountry() != null ? e.getLocationCountry() : "Unknown");
            job.setScheduledStartDate(LocalDate.now().plusDays(7).atStartOfDay().atOffset(java.time.ZoneOffset.UTC));
            job.setScheduledEndDate(LocalDate.now().plusDays(7).atTime(17, 0).atOffset(java.time.ZoneOffset.UTC));
            job.setInternalNotes("Automated annual safety check reminder for " + e.getMake() + " " + e.getModel());

            fieldJobRepository.save(job);
            log.info("Created automated safety check field job for: {}", e.getInternalCode());
        }
    }
}
