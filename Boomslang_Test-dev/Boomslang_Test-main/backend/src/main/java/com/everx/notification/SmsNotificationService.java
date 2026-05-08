package com.everx.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsNotificationService {

    public void sendSms(String phoneNumber, String message) {
        log.info("Sending SMS to {}: {}", phoneNumber, message);
    }

    public boolean sendSmsWithDelivery(String phoneNumber, String message) {
        log.info("Sending SMS with delivery confirmation to {}: {}", phoneNumber, message);
        return true; // Mock implementation
    }
}
