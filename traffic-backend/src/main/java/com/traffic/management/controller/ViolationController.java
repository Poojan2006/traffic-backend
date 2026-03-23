package com.traffic.management.controller;

import com.traffic.management.entity.Violation;
import com.traffic.management.service.ViolationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/violations")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:5174","http://localhost:5175","http://localhost:5176","http://localhost:5177"})
public class ViolationController {

    private static final Logger logger = LoggerFactory.getLogger(ViolationController.class);

    private final ViolationService violationService;

    public ViolationController(ViolationService violationService) {
        this.violationService = violationService;
    }

    @PostMapping("/report")
    public ResponseEntity<Violation> reportViolation(
            @RequestParam("description") String description,
            @RequestParam("vehicleNo") String vehicleNo,
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "location", defaultValue = "") String location) throws IOException {
        logger.info("Received violation report: vehicleNo={}, description={}, location={}, imageSize={}", vehicleNo, description, location, image.getSize());
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(violationService.reportViolation(description, vehicleNo, image, location, email));
    }

    @PostMapping("/issue-fine")
    public ResponseEntity<Violation> issueFine(
            @RequestParam("vehicleNo") String vehicleNo,
            @RequestParam("description") String description,
            @RequestParam("fineAmount") Double fineAmount,
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "location", defaultValue = "") String location) throws IOException {
        logger.info("Issuing fine: vehicleNo={}, fineAmount={}, location={}", vehicleNo, fineAmount, location);
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(violationService.issueFine(vehicleNo, description, fineAmount, image, location, email));
    }

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeImage(
            @RequestParam("image") MultipartFile image) throws IOException {
        logger.info("Received image for analysis: size={}", image.getSize());
        return ResponseEntity.ok(violationService.analyzeImage(image));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Violation>> getPendingViolations() {
        return ResponseEntity.ok(violationService.getPendingViolations());
    }

    @GetMapping("/issued")
    public ResponseEntity<List<Violation>> getIssuedViolations() {
        return ResponseEntity.ok(violationService.getIssuedViolations());
    }

    @PutMapping("/verify/{id}")
    public ResponseEntity<Violation> verifyViolation(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        String action = (String) payload.get("action");
        String vehicleNo = (String) payload.getOrDefault("vehicleNo", "");
        Double fineAmount = payload.containsKey("fineAmount") && payload.get("fineAmount") != null 
                ? Double.valueOf(payload.get("fineAmount").toString()) 
                : null;
        
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(violationService.verifyViolation(id, action, fineAmount, vehicleNo, email));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Violation>> getMyViolations() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(violationService.getMyViolations(email));
    }

    @GetMapping("/image/{id}")
    public ResponseEntity<byte[]> getViolationImage(@PathVariable Long id) {
        byte[] image = violationService.getViolationImage(id);
        if (image == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(image);
    }

    @GetMapping("/vehicle/{vehicleNo}")
    public ResponseEntity<List<Violation>> getViolationsByVehicle(@PathVariable String vehicleNo) {
        return ResponseEntity.ok(violationService.getViolationsByVehicle(vehicleNo));
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<Violation> payFine(@PathVariable Long id) {
        return ResponseEntity.ok(violationService.payFine(id));
    }
}
