package com.everx.shared.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${everx.mail.from:noreply@everx.com}")
    private String fromEmail;

    public void sendSimpleMessage(String to, String subject, String text) {
        try {
            log.info("Sending email to {} with subject: {}", to, subject);
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("Email sent successfully");
        } catch (Exception e) {
            log.error("Failed to send email: {}", e.getMessage());
            // In a real prod environment, we might push this to a retry queue
        }
    }
}
