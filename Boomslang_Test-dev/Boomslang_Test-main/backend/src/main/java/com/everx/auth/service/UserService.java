package com.everx.auth.service;

import com.everx.auth.dto.CreateUserRequest;
import com.everx.auth.dto.UpdateUserRequest;
import com.everx.auth.dto.UserDto;
import com.everx.auth.entity.User;
import com.everx.auth.repository.UserRepository;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.UUID;

@Service
@Transactional
@Slf4j
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Get paginated list of all active users
     */
    public Page<UserDto> getAllUsers(@NonNull Pageable pageable) {
        log.info("Fetching all active users - page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        return userRepository.findAllActive(pageable).map(UserDto::fromEntity);
    }

    /**
     * Get user by ID
     */
    public UserDto getUserById(@NonNull UUID userId) {
        log.info("Fetching user by ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        return UserDto.fromEntity(user);
    }

    /**
     * Get user by email
     */
    public UserDto getUserByEmail(@NonNull String email) {
        log.info("Fetching user by email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
        return UserDto.fromEntity(user);
    }

    /**
     * Create new user
     */
    public UserDto createUser(@NonNull CreateUserRequest request) {
        log.info("Creating new user with email: {}", request.getEmail());

        // Validate email uniqueness
        if (userRepository.existsActiveByEmail(request.getEmail())) {
            log.warn("User with email {} already exists", request.getEmail());
            throw new ValidationException("email", "Email already in use");
        }

        try {
            User.UserRole role = User.UserRole.valueOf(request.getRole().toUpperCase());
            User.OfficeLocation location = User.OfficeLocation.valueOf(request.getOfficeLocation().toUpperCase());

            // Parse fullName into firstName and lastName
            String[] nameParts = request.getFullName().trim().split("\\s+", 2);
            String firstName = nameParts[0];
            String lastName = nameParts.length > 1 ? nameParts[1] : nameParts[0];

            User user = User.builder()
                    .email(request.getEmail())
                    .passwordHash(passwordEncoder.encode(request.getPassword()))
                    .fullName(request.getFullName())
                    .firstName(firstName)
                    .lastName(lastName)
                    .phone(request.getPhone())
                    .role(role)
                    .officeLocation(location)
                    .isActive(true)
                    .build();

            User savedUser = Objects.requireNonNull(userRepository.save(user));
            log.info("User created successfully with ID: {}", savedUser.getId());
            return UserDto.fromEntity(savedUser);
        } catch (IllegalArgumentException | NullPointerException e) {
            log.error("Invalid role or office location: {}", e.getMessage());
            throw new ValidationException("role", "Invalid role or office location");
        }
    }

    /**
     * Update user
     */
    public UserDto updateUser(@NonNull UUID userId, @NonNull UpdateUserRequest request) {
        log.info("Updating user with ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsActiveByEmail(request.getEmail())) {
                throw new ValidationException("email", "Email already in use");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        if (request.getRole() != null) {
            try {
                user.setRole(User.UserRole.valueOf(request.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new ValidationException("role", "Invalid role");
            }
        }

        if (request.getOfficeLocation() != null) {
            try {
                user.setOfficeLocation(User.OfficeLocation.valueOf(request.getOfficeLocation().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new ValidationException("officeLocation", "Invalid office location");
            }
        }

        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }

        User updatedUser = userRepository.save(user);
        log.info("User updated successfully: {}", userId);
        return UserDto.fromEntity(Objects.requireNonNull(updatedUser, "Updated user is null"));
    }

    /**
     * Delete user (soft delete)
     */
    public void deleteUser(@NonNull UUID userId) {
        log.info("Deleting user: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        user.setIsDeleted(true);
        userRepository.save(user);
        log.info("User soft-deleted successfully: {}", userId);
    }

    /**
     * Get users by role
     */
    public Page<UserDto> getUsersByRole(String role, Pageable pageable) {
        log.info("Fetching users with role: {}", role);
        try {
            User.UserRole userRole = User.UserRole.valueOf(role.toUpperCase());
            return userRepository.findByRole(userRole, pageable).map(UserDto::fromEntity);
        } catch (IllegalArgumentException e) {
            throw new ValidationException("role", "Invalid role: " + role);
        }
    }

    /**
     * Change user password
     */
    public void changePassword(@NonNull UUID userId, @NonNull String currentPassword, @NonNull String newPassword) {
        log.info("Changing password for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new ValidationException("currentPassword", "Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password changed successfully for user: {}", userId);
    }

    /**
     * Toggle user active status
     */
    public UserDto toggleUserStatus(@NonNull UUID userId) {
        log.info("Toggling status for user: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        
        user.setIsActive(!user.getIsActive());
        User updatedUser = userRepository.save(user);
        return UserDto.fromEntity(Objects.requireNonNull(updatedUser, "Updated user is null"));
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("Loading user by username: {}", username);
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
        return user;
    }
}
