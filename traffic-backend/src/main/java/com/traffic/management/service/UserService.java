package com.traffic.management.service;

import com.traffic.management.entity.User;
import com.traffic.management.entity.Role;
import com.traffic.management.repository.UserRepository;
import com.traffic.management.config.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public User registerUser(User user) {
        System.out.println("Registering USER: " + user.getEmail());
        user.setRole(Role.USER); // Always force USER role for public registration
        return registerInternal(user);
    }

    public User registerUserFromAdmin(User user) {
        System.out.println("Admin registering user: " + user.getEmail() + " with role: " + user.getRole());
        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }
        return registerInternal(user);
    }

    private User registerInternal(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        try {
            User savedUser = userRepository.save(user);
            System.out.println("Successfully saved user: " + savedUser.getId() + " with role: " + savedUser.getRole());
            return savedUser;
        } catch (Exception e) {
            System.err.println("Database error during registration: " + e.getMessage());
            throw e;
        }
    }

    public String login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (passwordEncoder.matches(password, user.getPassword())) {
            return jwtService.generateToken(user.getEmail());
        } else {
            throw new RuntimeException("Invalid credentials");
        }
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (userDetails.getUsername() != null) user.setUsername(userDetails.getUsername());
        if (userDetails.getRole() != null) user.setRole(userDetails.getRole());
        
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }
        
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public void uploadImage(Long id, MultipartFile file) throws IOException {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setImage(file.getBytes());
        userRepository.save(user);
    }

    public byte[] getImage(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getImage();
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}