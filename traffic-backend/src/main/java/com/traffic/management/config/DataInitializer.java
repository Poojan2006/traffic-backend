package com.traffic.management.config;

import com.traffic.management.entity.Role;
import com.traffic.management.entity.User;
import com.traffic.management.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds a default admin + police account on every startup.
 * Credentials:
 *   Admin  → email: admin@trivo.com   / password: admin123
 *   Police → email: police@trivo.com  / password: police123
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUser("Admin",  "admin@trivo.com",  "admin123",  Role.ADMIN);
        seedUser("Officer Raj", "police@trivo.com", "police123", Role.POLICE);
    }

    private void seedUser(String name, String email, String rawPassword, Role role) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User user = new User();
            user.setUsername(name);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setRole(role);
            userRepository.save(user);
            System.out.println("✅ Seeded " + role + " account: " + email);
        }
    }
}
