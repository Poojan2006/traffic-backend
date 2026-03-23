package com.traffic.management.service;

import com.traffic.management.entity.Role;
import com.traffic.management.entity.User;
import com.traffic.management.repository.UserRepository;
import com.traffic.management.config.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void registerUser_ShouldSetRoleToUser() {
        User user = new User();
        user.setEmail("test@user.com");
        user.setPassword("password");
        user.setRole(Role.ADMIN); // Attempt to register as ADMIN

        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User savedUser = userService.registerUser(user);

        assertEquals(Role.USER, savedUser.getRole());
        assertEquals("test@user.com", savedUser.getEmail());
    }

    @Test
    void registerUserFromAdmin_ShouldSetRoleToUserIfNull() {
        User user = new User();
        user.setEmail("police@test.com");
        user.setPassword("password");
        user.setRole(null); // No explicit role, falls back to USER

        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User savedUser = userService.registerUserFromAdmin(user);

        assertEquals(Role.USER, savedUser.getRole());
        assertEquals("police@test.com", savedUser.getEmail());
    }
}
