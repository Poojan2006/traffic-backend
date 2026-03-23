package com.traffic.management.controller;

import com.traffic.management.entity.User;
import com.traffic.management.service.UserService;
import com.traffic.management.config.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;

    public UserController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/auth/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        // Public registration is ONLY for civilians — enforce USER role regardless of
        // payload
        user.setRole(com.traffic.management.entity.Role.USER);
        System.out.println("Civilian self-registration for: " + user.getEmail());
        return ResponseEntity.ok(userService.registerUser(user));
    }

    @PostMapping("/admin/register-user")
    public ResponseEntity<User> registerUserFromAdmin(@RequestBody User user) {
        System.out.println("Admin registering user: " + user.getEmail() + " with role " + user.getRole());
        return ResponseEntity.ok(userService.registerUserFromAdmin(user));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String token = userService.login(email, request.get("password"));
        User user = userService.findByEmail(email).orElseThrow();
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/auth/verify")
    public ResponseEntity<Map<String, Object>> verify(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);
        if (jwtService.validateToken(token, email)) {
            User user = userService.findByEmail(email).orElseThrow();
            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("user", user);
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/upload/{id}")
    public ResponseEntity<String> uploadImage(@PathVariable Long id, @RequestParam("file") MultipartFile file)
            throws IOException {
        userService.uploadImage(id, file);
        return ResponseEntity.ok("Image uploaded successfully");
    }

    @GetMapping("/users/image/{id}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long id) {
        byte[] image = userService.getImage(id);
        if (image == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(image);
    }
}