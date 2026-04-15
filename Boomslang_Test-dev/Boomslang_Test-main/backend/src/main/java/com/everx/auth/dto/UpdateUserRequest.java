package com.everx.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserRequest {

    @Email(message = "Email should be valid")
    private String email;

    private String fullName;

    private String phone;

    private String role; // Optional, can be updated separately

    private String officeLocation;

    private Boolean isActive;
}
