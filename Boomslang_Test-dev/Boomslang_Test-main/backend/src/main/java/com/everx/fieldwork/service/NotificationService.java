package com.everx.fieldwork.service;

import com.everx.fieldwork.entity.FieldJob;
import com.everx.fieldwork.entity.Technician;
import com.everx.fieldwork.repository.TechnicianRepository;
import com.everx.notification.EmailNotificationService;
import com.everx.notification.PushNotificationService;
import com.everx.notification.SmsNotificationService;
import com.everx.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationService {

    private final TechnicianRepository technicianRepository;
    private final SmsNotificationService smsNotificationService;
    private final EmailNotificationService emailNotificationService;
    private final PushNotificationService pushNotificationService;

    public void sendJobAssignmentNotification(FieldJob fieldJob) {
        log.info("Sending job assignment notification for job: {}", fieldJob.getJobNumber());

        if (fieldJob.getAssignedTechnicianId() == null) {
            log.warn("No technician assigned to job: {}", fieldJob.getJobNumber());
            return;
        }

        try {
            Technician technician = technicianRepository.findById(UUID.fromString(fieldJob.getAssignedTechnicianId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Technician not found"));

            String message = buildJobAssignmentMessage(fieldJob);
            
            // Send SMS if enabled
            if (technician.getSmsNotificationsEnabled() && technician.getMobilePhone() != null) {
                smsNotificationService.sendSms(technician.getMobilePhone(), message);
            }

            // Send email if enabled
            if (technician.getEmailNotificationsEnabled() && technician.getEmail() != null) {
                emailNotificationService.sendJobAssignmentEmail(technician.getEmail(), fieldJob);
            }

            // Send push notification if enabled
            if (technician.getPushNotificationsEnabled()) {
                pushNotificationService.sendJobAssignmentPush(technician.getId().toString(), fieldJob);
            }

        } catch (Exception e) {
            log.error("Failed to send job assignment notification for job: {}", fieldJob.getJobNumber(), e);
        }
    }

    public void sendStatusChangeNotification(FieldJob fieldJob, FieldJob.JobStatus previousStatus) {
        log.info("Sending status change notification for job: {} from {} to {}", 
                fieldJob.getJobNumber(), previousStatus, fieldJob.getStatus());

        try {
            // Notify technician
            if (fieldJob.getAssignedTechnicianId() != null) {
                Technician technician = technicianRepository.findById(UUID.fromString(fieldJob.getAssignedTechnicianId()))
                        .orElse(null);

                if (technician != null) {
                    String message = buildStatusChangeMessage(fieldJob, previousStatus);
                    
                    if (technician.getSmsNotificationsEnabled() && technician.getMobilePhone() != null) {
                        smsNotificationService.sendSms(technician.getMobilePhone(), message);
                    }

                    if (technician.getEmailNotificationsEnabled() && technician.getEmail() != null) {
                        emailNotificationService.sendStatusChangeEmail(technician.getEmail(), fieldJob, previousStatus);
                    }

                    if (technician.getPushNotificationsEnabled()) {
                        pushNotificationService.sendStatusChangePush(technician.getId().toString(), fieldJob, previousStatus);
                    }
                }
            }

            // Notify customer if applicable
            sendCustomerStatusNotification(fieldJob, previousStatus);

        } catch (Exception e) {
            log.error("Failed to send status change notification for job: {}", fieldJob.getJobNumber(), e);
        }
    }

    public void sendJobCompletionNotification(FieldJob fieldJob) {
        log.info("Sending job completion notification for job: {}", fieldJob.getJobNumber());

        try {
            // Notify manager/supervisor
            sendManagerNotification(fieldJob, "Job completed", 
                    String.format("Job %s has been completed by technician", fieldJob.getJobNumber()));

            // Send customer completion notification
            sendCustomerCompletionNotification(fieldJob);

        } catch (Exception e) {
            log.error("Failed to send job completion notification for job: {}", fieldJob.getJobNumber(), e);
        }
    }

    public void sendEmergencyNotification(FieldJob fieldJob, String emergencyType, String message) {
        log.info("Sending emergency notification for job: {} - {}", fieldJob.getJobNumber(), emergencyType);

        try {
            // Send to all managers
            sendEmergencyManagerNotification(fieldJob, emergencyType, message);

            // Send to safety team if applicable
            if (emergencyType.contains("SAFETY") || emergencyType.contains("ACCIDENT")) {
                sendSafetyTeamNotification(fieldJob, emergencyType, message);
            }

        } catch (Exception e) {
            log.error("Failed to send emergency notification for job: {}", fieldJob.getJobNumber(), e);
        }
    }

    public void sendScheduleReminderNotification(FieldJob fieldJob) {
        log.info("Sending schedule reminder notification for job: {}", fieldJob.getJobNumber());

        try {
            if (fieldJob.getAssignedTechnicianId() != null) {
                Technician technician = technicianRepository.findById(UUID.fromString(fieldJob.getAssignedTechnicianId()))
                        .orElse(null);

                if (technician != null) {
                    String message = buildScheduleReminderMessage(fieldJob);
                    
                    if (technician.getSmsNotificationsEnabled() && technician.getMobilePhone() != null) {
                        smsNotificationService.sendSms(technician.getMobilePhone(), message);
                    }

                    if (technician.getEmailNotificationsEnabled() && technician.getEmail() != null) {
                        emailNotificationService.sendScheduleReminderEmail(technician.getEmail(), fieldJob);
                    }

                    if (technician.getPushNotificationsEnabled()) {
                        pushNotificationService.sendScheduleReminderPush(technician.getId().toString(), fieldJob);
                    }
                }
            }

        } catch (Exception e) {
            log.error("Failed to send schedule reminder notification for job: {}", fieldJob.getJobNumber(), e);
        }
    }

    public void sendWeatherAlertNotification(FieldJob fieldJob, String weatherCondition, String recommendation) {
        log.info("Sending weather alert notification for job: {} - {}", fieldJob.getJobNumber(), weatherCondition);

        try {
            if (fieldJob.getAssignedTechnicianId() != null) {
                Technician technician = technicianRepository.findById(UUID.fromString(fieldJob.getAssignedTechnicianId()))
                        .orElse(null);

                if (technician != null) {
                    String message = buildWeatherAlertMessage(fieldJob, weatherCondition, recommendation);
                    
                    if (technician.getSmsNotificationsEnabled() && technician.getMobilePhone() != null) {
                        smsNotificationService.sendSms(technician.getMobilePhone(), message);
                    }

                    if (technician.getEmailNotificationsEnabled() && technician.getEmail() != null) {
                        emailNotificationService.sendWeatherAlertEmail(technician.getEmail(), fieldJob, weatherCondition, recommendation);
                    }

                    if (technician.getPushNotificationsEnabled()) {
                        pushNotificationService.sendWeatherAlertPush(technician.getId().toString(), fieldJob, weatherCondition, recommendation);
                    }
                }
            }

        } catch (Exception e) {
            log.error("Failed to send weather alert notification for job: {}", fieldJob.getJobNumber(), e);
        }
    }

    // Private helper methods

    private String buildJobAssignmentMessage(FieldJob fieldJob) {
        return String.format("New job assigned: %s\nLocation: %s\nDate: %s\nCustomer: %s\nPriority: %s\n\nPlease check your app for details.",
                fieldJob.getJobNumber(),
                fieldJob.getLocation(),
                fieldJob.getScheduledDate().toLocalDate(),
                fieldJob.getCustomerName(),
                fieldJob.getPriority());
    }

    private String buildStatusChangeMessage(FieldJob fieldJob, FieldJob.JobStatus previousStatus) {
        return String.format("Job status updated: %s\nStatus changed from %s to %s\nLocation: %s\n\nPlease check your app for details.",
                fieldJob.getJobNumber(),
                previousStatus,
                fieldJob.getStatus(),
                fieldJob.getLocation());
    }

    private String buildScheduleReminderMessage(FieldJob fieldJob) {
        return String.format("Job reminder: %s\nScheduled for: %s\nLocation: %s\nCustomer: %s\n\nPlease arrive on time.",
                fieldJob.getJobNumber(),
                fieldJob.getScheduledDate(),
                fieldJob.getLocation(),
                fieldJob.getCustomerName());
    }

    private String buildWeatherAlertMessage(FieldJob fieldJob, String weatherCondition, String recommendation) {
        return String.format("Weather alert for job %s:\nCondition: %s\nRecommendation: %s\nLocation: %s\n\nPlease plan accordingly.",
                fieldJob.getJobNumber(),
                weatherCondition,
                recommendation,
                fieldJob.getLocation());
    }

    private void sendCustomerStatusNotification(FieldJob fieldJob, FieldJob.JobStatus previousStatus) {
        // Only send customer notifications for specific status changes
        if (shouldNotifyCustomerOfStatusChange(previousStatus, fieldJob.getStatus())) {
            String message = buildCustomerStatusMessage(fieldJob, previousStatus);
            
            if (fieldJob.getCustomerPhone() != null) {
                smsNotificationService.sendSms(fieldJob.getCustomerPhone(), message);
            }

            if (fieldJob.getCustomerEmail() != null) {
                emailNotificationService.sendCustomerStatusEmail(fieldJob.getCustomerEmail(), fieldJob, previousStatus);
            }
        }
    }

    private void sendCustomerCompletionNotification(FieldJob fieldJob) {
        String message = String.format("Your job %s has been completed.\nLocation: %s\nTechnician notes: %s\n\nThank you for your business!",
                fieldJob.getJobNumber(),
                fieldJob.getLocation(),
                fieldJob.getCompletionNotes() != null ? fieldJob.getCompletionNotes() : "No notes provided");

        if (fieldJob.getCustomerPhone() != null) {
            smsNotificationService.sendSms(fieldJob.getCustomerPhone(), message);
        }

        if (fieldJob.getCustomerEmail() != null) {
            emailNotificationService.sendCustomerCompletionEmail(fieldJob.getCustomerEmail(), fieldJob);
        }
    }

    private void sendManagerNotification(FieldJob fieldJob, String subject, String message) {
        // This would typically send to a manager group or specific manager
        // Implementation depends on your organization structure
        log.info("Manager notification: {} - {}", subject, message);
    }

    private void sendEmergencyManagerNotification(FieldJob fieldJob, String emergencyType, String message) {
        String fullMessage = String.format("EMERGENCY - %s\nJob: %s\nLocation: %s\nTechnician: %s\n\n%s",
                emergencyType,
                fieldJob.getJobNumber(),
                fieldJob.getLocation(),
                fieldJob.getAssignedTechnicianId(),
                message);

        sendManagerNotification(fieldJob, "Emergency Alert", fullMessage);
    }

    private void sendSafetyTeamNotification(FieldJob fieldJob, String emergencyType, String message) {
        // Send to safety team/department
        log.info("Safety team notification: {} - {} - {}", emergencyType, fieldJob.getJobNumber(), message);
    }

    private String buildCustomerStatusMessage(FieldJob fieldJob, FieldJob.JobStatus previousStatus) {
        return String.format("Update on your job %s:\nStatus changed from %s to %s\nLocation: %s\n\nWe'll keep you informed of progress.",
                fieldJob.getJobNumber(),
                previousStatus,
                fieldJob.getStatus(),
                fieldJob.getLocation());
    }

    private boolean shouldNotifyCustomerOfStatusChange(FieldJob.JobStatus previousStatus, FieldJob.JobStatus newStatus) {
        // Define which status changes should trigger customer notifications
        return (previousStatus == FieldJob.JobStatus.SCHEDULED && newStatus == FieldJob.JobStatus.IN_PROGRESS) ||
               (previousStatus == FieldJob.JobStatus.IN_PROGRESS && newStatus == FieldJob.JobStatus.COMPLETED) ||
               newStatus == FieldJob.JobStatus.CANCELLED;
    }
}
