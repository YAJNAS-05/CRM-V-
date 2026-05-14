package com.everx.auth.dto;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserRequest {

    @Email(message = "Email should be valid")
    private String email;

    private String fullName;

    private String phone;

    private String role;

    @Builder.Default
    private List<String> roles = List.of();

    private String officeLocation;

    private Boolean isActive;
}
