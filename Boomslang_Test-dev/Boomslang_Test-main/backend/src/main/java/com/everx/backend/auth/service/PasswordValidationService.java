package com.everx.backend.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Service for validating password strength and complexity
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordValidationService {
    
    @Value("${security.password.min-length:12}")
    private int minLength;
    
    @Value("${security.password.require-uppercase:true}")
    private boolean requireUppercase;
    
    @Value("${security.password.require-lowercase:true}")
    private boolean requireLowercase;
    
    @Value("${security.password.require-digits:true}")
    private boolean requireDigits;
    
    @Value("${security.password.require-special-chars:true}")
    private boolean requireSpecialChars;
    
    private static final String SPECIAL_CHARS_PATTERN = "[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]";
    private static final int MAX_CONSECUTIVE_SAME_CHAR = 3;
    
    /**
     * Validates password against security policy
     */
    public PasswordValidationResult validate(String password) {
        PasswordValidationResult result = new PasswordValidationResult();
        
        if (password == null || password.isEmpty()) {
            result.addError("Password cannot be empty");
            return result;
        }
        
        if (password.length() < minLength) {
            result.addError(String.format("Password must be at least %d characters long", minLength));
        }
        
        if (requireUppercase && !containsUppercase(password)) {
            result.addError("Password must contain at least one uppercase letter");
        }
        
        if (requireLowercase && !containsLowercase(password)) {
            result.addError("Password must contain at least one lowercase letter");
        }
        
        if (requireDigits && !containsDigit(password)) {
            result.addError("Password must contain at least one digit");
        }
        
        if (requireSpecialChars && !containsSpecialChar(password)) {
            result.addError("Password must contain at least one special character");
        }
        
        if (hasConsecutiveChars(password)) {
            result.addError("Password cannot contain more than 3 consecutive identical characters");
        }
        
        if (isCommonPassword(password)) {
            result.addError("Password is too common. Please choose a stronger password");
        }
        
        return result;
    }
    
    /**
     * Gets password strength score (0-100)
     */
    public int getStrengthScore(String password) {
        if (password == null || password.isEmpty()) {
            return 0;
        }
        
        int score = 0;
        
        // Length bonus (max 30 points)
        score += Math.min(30, password.length() * 2);
        
        // Character variety bonus (max 40 points)
        if (containsUppercase(password)) score += 10;
        if (containsLowercase(password)) score += 10;
        if (containsDigit(password)) score += 10;
        if (containsSpecialChar(password)) score += 10;
        
        // Entropy bonus (max 30 points)
        score += Math.min(30, Math.log(password.length()) * 10);
        
        return Math.min(100, score);
    }
    
    private boolean containsUppercase(String password) {
        return password.matches(".*[A-Z].*");
    }
    
    private boolean containsLowercase(String password) {
        return password.matches(".*[a-z].*");
    }
    
    private boolean containsDigit(String password) {
        return password.matches(".*\\d.*");
    }
    
    private boolean containsSpecialChar(String password) {
        return password.matches(".*" + SPECIAL_CHARS_PATTERN + ".*");
    }
    
    private boolean hasConsecutiveChars(String password) {
        for (int i = 0; i < password.length() - MAX_CONSECUTIVE_SAME_CHAR; i++) {
            char ch = password.charAt(i);
            boolean allSame = true;
            for (int j = i + 1; j < i + MAX_CONSECUTIVE_SAME_CHAR + 1; j++) {
                if (password.charAt(j) != ch) {
                    allSame = false;
                    break;
                }
            }
            if (allSame) {
                return true;
            }
        }
        return false;
    }
    
    private boolean isCommonPassword(String password) {
        // List of common passwords to reject
        String[] commonPasswords = {
            "password", "123456", "qwerty", "abc123", "letmein", 
            "welcome", "monkey", "dragon", "admin", "master"
        };
        
        String lowerPassword = password.toLowerCase();
        for (String common : commonPasswords) {
            if (lowerPassword.contains(common)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Inner class for validation results
     */
    public static class PasswordValidationResult {
        private final java.util.List<String> errors = new java.util.ArrayList<>();
        
        public void addError(String error) {
            errors.add(error);
        }
        
        public boolean isValid() {
            return errors.isEmpty();
        }
        
        public java.util.List<String> getErrors() {
            return errors;
        }
        
        public String getErrorMessage() {
            return String.join("; ", errors);
        }
    }
}
