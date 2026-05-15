package com.everx.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    @JsonProperty("email")
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @JsonProperty("password")
    @NotBlank(message = "Password is required")
    private String password;
}
