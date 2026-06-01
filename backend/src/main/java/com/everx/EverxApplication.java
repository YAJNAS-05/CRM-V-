package com.everx;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
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
@EnableJpaRepositories
public class EverxApplication {

    public static void main(String[] args) {
        SpringApplication.run(EverxApplication.class, args);
    }

    @Bean
    @Profile("prod")
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        // Intentionally no bootstrap users in production.
        return args -> {
            // no-op
        };
    }

}
