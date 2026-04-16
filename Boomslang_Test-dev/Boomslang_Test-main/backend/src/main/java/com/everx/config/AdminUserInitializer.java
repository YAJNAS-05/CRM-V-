package com.everx.config;

import com.everx.auth.entity.Role;
import com.everx.auth.entity.User;
import com.everx.auth.repository.RoleRepository;
import com.everx.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Initializes default admin user on application startup (runs after RbacDataInitializer)
 */
@Slf4j
@Component
@RequiredArgsConstructor
@Order(2)
public class AdminUserInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        try {
            String adminEmail = "admin@everx.com";
            
            // Check if admin user already exists
            if (userRepository.findByEmail(adminEmail).isPresent()) {
                log.info("Admin user already exists: {}", adminEmail);
                return;
            }

            // Fetch ADMIN role (must exist from RbacDataInitializer)
            Role adminRole = roleRepository.findByNameWithPermissions("ADMIN")
                    .orElseThrow(() -> new IllegalStateException("ADMIN role not found. Ensure RbacDataInitializer runs before AdminUserInitializer"));

            // Create admin user
            User adminUser = new User();
            adminUser.setId(UUID.randomUUID());
            adminUser.setEmail(adminEmail);
            adminUser.setFirstName("Admin");
            adminUser.setLastName("User");
            adminUser.setFullName("Admin User");
            adminUser.setPasswordHash(passwordEncoder.encode("Admin@123!"));
            adminUser.setRole(User.UserRole.ADMIN);
            adminUser.setIsActive(true);
            adminUser.setIsDeleted(false);
            adminUser.setPhone("+1-555-1234");
            adminUser.setOfficeLocation(User.OfficeLocation.USA);
            
            // Assign ADMIN role to assignedRoles collection (critical for authorization)
            Set<Role> assignedRoles = new HashSet<>();
            assignedRoles.add(adminRole);
            adminUser.setAssignedRoles(assignedRoles);
            
            adminUser.setCreatedAt(java.time.OffsetDateTime.now());
            adminUser.setUpdatedAt(java.time.OffsetDateTime.now());
            adminUser.setVersion(0L);

            userRepository.save(adminUser);
            log.info("✓ Admin user created successfully: {} with ADMIN role assigned", adminEmail);
        } catch (Exception e) {
            log.error("Error initializing admin user", e);
            throw e;
        }
    }
}
