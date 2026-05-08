package com.everx.fieldwork.integration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SmsNotificationService {

    @Value("${twilio.api.key}")
    private String twilioApiKey;

    @Value("${twilio.api.secret}")
    private String twilioApiSecret;

    @Value("${twilio.phone.number}")
    private String twilioPhoneNumber;

    public void sendSms(String phoneNumber, String message) {
        try {
            log.info("Sending SMS to {}: {}", phoneNumber, message);
            // Implementation would use Twilio SDK or REST API
            // This is a placeholder for the actual SMS sending logic
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", phoneNumber, e.getMessage());
        }
    }
}
