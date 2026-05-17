package com.everx.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @JsonProperty("email")
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @JsonProperty("password")
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @JsonProperty("fullName")
    @NotBlank(message = "Full name is required")
    private String fullName;

    @JsonProperty("phone")
    private String phone;
}
