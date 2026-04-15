package com.everx;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.everx.auth.entity.User;
import com.everx.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.OffsetDateTime;

@SpringBootApplication
@EnableScheduling
public class EverxApplication {

    public static void main(String[] args) {
        SpringApplication.run(EverxApplication.class, args);
    }

    @Bean
    @Profile("prod")
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByEmail("admin@everx.com").isEmpty()) {
                User admin = User.builder()
                        .email("admin@everx.com")
                        .passwordHash(passwordEncoder.encode("password123"))
                        .firstName("Admin")
                        .lastName("User")
                        .fullName("Admin User")
                        .role(User.UserRole.ADMIN)
                        .officeLocation(User.OfficeLocation.AUSTRALIA)
                        .isActive(true)
                        .createdAt(OffsetDateTime.now())
                        .updatedAt(OffsetDateTime.now())
                        .isDeleted(false)
                        .build();
                userRepository.save(admin);
                System.out.println("Default admin user created: admin@everx.com / password123");
            }
        };
    }

}
