package com.everx.auth.service;

import com.everx.auth.dto.CreateUserRequest;
import com.everx.auth.dto.UpdateUserRequest;
import com.everx.auth.dto.UserDto;
import com.everx.auth.entity.User;
import com.everx.auth.repository.UserRepository;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private CreateUserRequest createUserRequest;
    private UpdateUserRequest updateUserRequest;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testUser = User.builder()
                .id(testUserId)
                .email("admin@everx.com")
                .passwordHash("hashedPassword")
                .fullName("Administrator")
                .phone("+61412345678")
                .role(User.UserRole.ADMIN)
                .officeLocation(User.OfficeLocation.AUSTRALIA)
                .isActive(true)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        createUserRequest = CreateUserRequest.builder()
                .email("newuser@everx.com")
                .password("password123")
                .fullName("New User")
                .phone("+61412345678")
                .role("SALES_REP")
                .officeLocation("AUSTRALIA")
                .build();

        updateUserRequest = UpdateUserRequest.builder()
                .fullName("Updated Name")
                .isActive(true)
                .build();
    }

    @Test
    void testGetAllUsers() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 20);
        Page<User> userPage = new PageImpl<>(List.of(Objects.requireNonNull(testUser)));
        when(userRepository.findAllActive(pageable)).thenReturn(userPage);

        // Act
        Page<UserDto> result = userService.getAllUsers(pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("admin@everx.com", result.getContent().get(0).getEmail());
        verify(userRepository, times(1)).findAllActive(pageable);
    }

    @Test
    void testGetUserById_Success() {
        // Arrange
        UUID id = Objects.requireNonNull(testUserId);
        when(userRepository.findById(id)).thenReturn(Optional.of(Objects.requireNonNull(testUser)));

        // Act
        UserDto result = userService.getUserById(id);

        // Assert
        assertNotNull(result);
        assertEquals(id, result.getId());
        assertEquals("admin@everx.com", result.getEmail());
        verify(userRepository, times(1)).findById(id);
    }

    @Test
    void testGetUserById_NotFound() {
        // Arrange
        UUID id = Objects.requireNonNull(testUserId);
        when(userRepository.findById(any(UUID.class))).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> userService.getUserById(id));
        verify(userRepository, times(1)).findById(id);
    }

    @Test
    void testGetUserByEmail_Success() {
        // Arrange
        String email = "admin@everx.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(Objects.requireNonNull(testUser)));

        // Act
        UserDto result = userService.getUserByEmail(email);

        // Assert
        assertNotNull(result);
        assertEquals(email, result.getEmail());
        verify(userRepository, times(1)).findByEmail(email);
    }

    @Test
    void testCreateUser_Success() {
        // Arrange
        CreateUserRequest req = Objects.requireNonNull(createUserRequest);
        String email = Objects.requireNonNull(req.getEmail());
        String password = Objects.requireNonNull(req.getPassword());
        
        when(userRepository.existsActiveByEmail(email)).thenReturn(false);
        when(passwordEncoder.encode(password)).thenReturn("hashedPassword");
        
        User newUser = User.builder()
                .id(UUID.randomUUID())
                .email(email)
                .passwordHash("hashedPassword")
                .fullName(req.getFullName())
                .phone(req.getPhone())
                .role(User.UserRole.SALES_REP)
                .officeLocation(User.OfficeLocation.AUSTRALIA)
                .isActive(true)
                .build();
        when(userRepository.save(any(User.class))).thenReturn(newUser);

        // Act
        UserDto result = userService.createUser(req);

        // Assert
        assertNotNull(result);
        assertEquals(email, result.getEmail());
        assertEquals("SALES_REP", result.getRole());
        verify(userRepository, times(1)).existsActiveByEmail(email);
        verify(passwordEncoder, times(1)).encode(password);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testCreateUser_EmailAlreadyExists() {
        // Arrange
        CreateUserRequest req = Objects.requireNonNull(createUserRequest);
        String email = Objects.requireNonNull(req.getEmail());
        when(userRepository.existsActiveByEmail(email)).thenReturn(true);

        // Act & Assert
        assertThrows(ValidationException.class, () -> userService.createUser(req));
        verify(userRepository, times(1)).existsActiveByEmail(email);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testUpdateUser_Success() {
        // Arrange
        UUID id = Objects.requireNonNull(testUserId);
        User user = Objects.requireNonNull(testUser);
        UpdateUserRequest req = Objects.requireNonNull(updateUserRequest);
        
        when(userRepository.findById(id)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        // Act
        UserDto result = userService.updateUser(id, req);

        // Assert
        assertNotNull(result);
        assertEquals(req.getFullName(), result.getFullName());
        verify(userRepository, times(1)).findById(id);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testUpdateUser_NotFound() {
        // Arrange
        UUID id = Objects.requireNonNull(testUserId);
        UpdateUserRequest req = Objects.requireNonNull(updateUserRequest);
        when(userRepository.findById(any(UUID.class))).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> userService.updateUser(id, req));
        verify(userRepository, times(1)).findById(id);
    }

    @Test
    void testDeleteUser_Success() {
        // Arrange
        UUID id = Objects.requireNonNull(testUserId);
        User user = Objects.requireNonNull(testUser);
        when(userRepository.findById(id)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        // Act
        userService.deleteUser(id);

        // Assert
        verify(userRepository, times(1)).findById(id);
        verify(userRepository, times(1)).save(any(User.class));
        assertTrue(user.getIsDeleted());
    }

    @Test
    void testDeleteUser_NotFound() {
        // Arrange
        UUID id = Objects.requireNonNull(testUserId);
        when(userRepository.findById(any(UUID.class))).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> userService.deleteUser(id));
        verify(userRepository, times(1)).findById(id);
    }

    @Test
    void testGetUsersByRole_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 20);
        Page<User> userPage = new PageImpl<>(List.of(Objects.requireNonNull(testUser)));
        when(userRepository.findByRole(User.UserRole.ADMIN, pageable)).thenReturn(userPage);

        // Act
        Page<UserDto> result = userService.getUsersByRole("ADMIN", pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(userRepository, times(1)).findByRole(User.UserRole.ADMIN, pageable);
    }

    @Test
    void testChangePassword_Success() {
        // Arrange
        UUID id = Objects.requireNonNull(testUserId);
        User user = Objects.requireNonNull(testUser);
        when(userRepository.findById(id)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("currentPassword", user.getPasswordHash())).thenReturn(true);
        when(passwordEncoder.encode("newPassword")).thenReturn("newHashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        // Act
        userService.changePassword(id, "currentPassword", "newPassword");

        // Assert
        verify(userRepository, times(1)).findById(id);
        verify(passwordEncoder, times(1)).matches("currentPassword", user.getPasswordHash());
        verify(passwordEncoder, times(1)).encode("newPassword");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testChangePassword_IncorrectCurrentPassword() {
        // Arrange
        UUID id = Objects.requireNonNull(testUserId);
        User user = Objects.requireNonNull(testUser);
        when(userRepository.findById(id)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", user.getPasswordHash())).thenReturn(false);

        // Act & Assert
        assertThrows(ValidationException.class, () -> userService.changePassword(id, "wrongPassword", "newPassword"));
        verify(userRepository, times(1)).findById(id);
        verify(passwordEncoder, times(1)).matches("wrongPassword", user.getPasswordHash());
        verify(userRepository, never()).save(any(User.class));
    }
}
