package com.everx.auth.controller;

import com.everx.auth.dto.ChangePasswordRequest;
import com.everx.auth.dto.CreateUserRequest;
import com.everx.auth.dto.UpdateUserRequest;
import com.everx.auth.dto.UserDto;
import com.everx.auth.service.UserService;
import com.everx.shared.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/users")
@Validated
@Slf4j
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * Get all users with pagination
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<UserDto>>> getAllUsers(
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) @NonNull Pageable pageable) {
        log.info("GET /api/v1/admin/users");
        Page<UserDto> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.ok(users, "Users retrieved successfully"));
    }

    /**
     * Get user by ID
     */
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable @NonNull UUID userId) {
        log.info("GET /api/v1/admin/users/{}", userId);
        UserDto user = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.ok(user, "User retrieved successfully"));
    }

    /**
     * Get users by role
     */
    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<UserDto>>> getUsersByRole(
            @PathVariable @NonNull String role,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) @NonNull Pageable pageable) {
        log.info("GET /api/v1/admin/users/role/{}", role);
        Page<UserDto> users = userService.getUsersByRole(role, pageable);
        return ResponseEntity.ok(ApiResponse.ok(users, "Users retrieved successfully"));
    }

    /**
     * Create new user
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> createUser(@Valid @RequestBody @NonNull CreateUserRequest request) {
        log.info("POST /api/v1/admin/users - email: {}", request.getEmail());
        UserDto user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(user, "User created successfully"));
    }

    /**
     * Update user
     */
    @PutMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable @NonNull UUID userId,
            @Valid @RequestBody @NonNull UpdateUserRequest request) {
        log.info("PUT /api/v1/admin/users/{}", userId);
        UserDto user = userService.updateUser(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(user, "User updated successfully"));
    }

    /**
     * Delete user (soft delete)
     */
    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable @NonNull UUID userId) {
        log.info("DELETE /api/v1/admin/users/{}", userId);
        userService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.ok(null, "User deleted successfully"));
    }

    /**
     * Change password
     */
    @PostMapping("/{userId}/change-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @PathVariable @NonNull UUID userId,
            @Valid @RequestBody @NonNull ChangePasswordRequest request) {
        log.info("POST /api/v1/admin/users/{}/change-password", userId);
        String currentPassword = Objects.requireNonNull(request.getCurrentPassword(), "Current password is null");
        String newPassword = Objects.requireNonNull(request.getNewPassword(), "New password is null");
        userService.changePassword(userId, currentPassword, newPassword);
        return ResponseEntity.ok(ApiResponse.ok(null, "Password changed successfully"));
    }

    /**
     * Toggle user active status
     */
    @PatchMapping("/{userId}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> toggleUserStatus(@PathVariable @NonNull UUID userId) {
        log.info("PATCH /api/v1/admin/users/{}/toggle-status", userId);
        UserDto user = userService.toggleUserStatus(userId);
        return ResponseEntity.ok(ApiResponse.ok(user, "User status updated"));
    }
}
