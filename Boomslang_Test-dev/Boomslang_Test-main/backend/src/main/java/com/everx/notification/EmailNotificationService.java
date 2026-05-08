package com.everx.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    public void sendEmail(String to, String subject, String body) {
        log.info("Sending email to {} with subject: {}", to, subject);
    }

    public boolean sendEmailWithAttachments(String to, String subject, String body, String[] attachments) {
        log.info("Sending email with attachments to {} with subject: {}", to, subject);
        return true; // Mock implementation
    }

    public void sendBulkEmail(String[] recipients, String subject, String body) {
        log.info("Sending bulk email to {} recipients", recipients.length);
    }
}
