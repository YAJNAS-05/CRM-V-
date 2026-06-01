package com.everx.auth.controller;

import com.everx.auth.dto.CreateUserRequest;
import com.everx.auth.dto.UpdateUserRequest;
import com.everx.auth.entity.User;
import com.everx.auth.repository.UserRepository;
import com.everx.shared.util.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User adminUser;
    private String adminToken;
    private UUID adminUserId;

    @BeforeEach
    void setUp() {
        // Create admin user for authentication
        adminUserId = UUID.randomUUID();
        adminUser = User.builder()
                .id(adminUserId)
                .email("admin@everx.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .fullName("Administrator")
                .phone("+61412345678")
                .role(User.UserRole.ADMIN)
                .officeLocation(User.OfficeLocation.AUSTRALIA)
                .isActive(true)
                .build();
        userRepository.save(adminUser);

        // Generate JWT token for admin with full admin permissions
        adminToken = jwtTokenProvider.generateAccessToken(
                adminUserId, 
                "admin@everx.com", 
                List.of(User.UserRole.ADMIN.name()), 
                List.of("USER_VIEW", "USER_CREATE", "USER_EDIT", "USER_DELETE")
        );
    }

    @Test
    void testGetAllUsers_Success() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isNotEmpty());
    }

    @Test
    void testGetUserById_Success() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users/{userId}", adminUserId)
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("admin@everx.com"));
    }

    @Test
    void testGetUserById_NotFound() throws Exception {
        UUID nonExistentId = UUID.randomUUID();
        mockMvc.perform(get("/api/v1/admin/users/{userId}", nonExistentId)
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void testCreateUser_Success() throws Exception {
        CreateUserRequest request = CreateUserRequest.builder()
                .email("newuser@everx.com")
                .password("password123")
                .fullName("New User")
                .phone("+61412345678")
                .role("SALES_REP")
                .officeLocation("AUSTRALIA")
                .build();

        mockMvc.perform(post("/api/v1/admin/users")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("newuser@everx.com"))
                .andExpect(jsonPath("$.data.role").value("SALES_REP"));
    }

    @Test
    void testCreateUser_InvalidEmail() throws Exception {
        CreateUserRequest request = CreateUserRequest.builder()
                .email("invalid-email")
                .password("password123")
                .fullName("New User")
                .role("SALES_REP")
                .officeLocation("AUSTRALIA")
                .build();

        mockMvc.perform(post("/api/v1/admin/users")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testCreateUser_DuplicateEmail() throws Exception {
        CreateUserRequest request = CreateUserRequest.builder()
                .email("admin@everx.com")
                .password("password123")
                .fullName("Duplicate User")
                .role("SALES_REP")
                .officeLocation("AUSTRALIA")
                .build();

        mockMvc.perform(post("/api/v1/admin/users")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testUpdateUser_Success() throws Exception {
        UpdateUserRequest request = UpdateUserRequest.builder()
                .fullName("Updated Admin Name")
                .isActive(true)
                .build();

        mockMvc.perform(put("/api/v1/admin/users/{userId}", adminUserId)
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fullName").value("Updated Admin Name"));
    }

    @Test
    void testDeleteUser_Success() throws Exception {
        // Create a user to delete
        User userToDelete = User.builder()
                .id(UUID.randomUUID())
                .email("todelete@everx.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .fullName("To Delete")
                .role(User.UserRole.READ_ONLY)
                .officeLocation(User.OfficeLocation.AUSTRALIA)
                .isActive(true)
                .build();
        User savedUser = userRepository.save(userToDelete);

        mockMvc.perform(delete("/api/v1/admin/users/{userId}", savedUser.getId())
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Verify soft delete
        User deletedUser = userRepository.findById(savedUser.getId()).orElse(null);
        assert deletedUser != null;
        assert deletedUser.getIsDeleted();
    }

    @Test
    void testUnauthorizedAccess() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetUsersByRole_Success() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users/role/ADMIN")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))));
    }
}
