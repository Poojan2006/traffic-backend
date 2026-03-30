package com.traffic.management.service;

import com.traffic.management.entity.Violation;
import com.traffic.management.entity.User;
import com.traffic.management.repository.ViolationRepository;
import com.traffic.management.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class ViolationService {

    private final ViolationRepository violationRepository;
    private final UserRepository userRepository;
    private final AiService aiService;

    public ViolationService(ViolationRepository violationRepository, UserRepository userRepository, AiService aiService) {
        this.violationRepository = violationRepository;
        this.userRepository = userRepository;
        this.aiService = aiService;
    }

    /** Civilian reports a suspected violation for review */
    public Violation reportViolation(String description, String vehicleNo, MultipartFile image, String location, String reporterEmail) throws IOException {
        User reporter = userRepository.findByEmail(reporterEmail)
                .orElseThrow(() -> new RuntimeException("Reporter not found"));
        
        Violation violation = new Violation();
        violation.setDescription(description);
        violation.setVehicleNo(vehicleNo);
        violation.setImage(image.getBytes());
        violation.setLocation(location);
        violation.setReporter(reporter);
        violation.setStatus(Violation.ViolationStatus.PENDING);
        
        return violationRepository.save(violation);
    }

    /** Police / Admin directly issues a verified fine */
    public Violation issueFine(String vehicleNo, String description, Double fineAmount, MultipartFile image, String location, String officerEmail) throws IOException {
        User officer = userRepository.findByEmail(officerEmail)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        Violation violation = new Violation();
        violation.setVehicleNo(vehicleNo);
        violation.setDescription(description);
        violation.setFineAmount(fineAmount);
        violation.setImage(image.getBytes());
        violation.setLocation(location);
        violation.setReporter(officer);
        violation.setStatus(Violation.ViolationStatus.VERIFIED);

        return violationRepository.save(violation);
    }

    public Map<String, Object> analyzeImage(MultipartFile image) throws IOException {
        String contentType = image.getContentType();
        return aiService.analyzeViolationImage(image.getBytes(), contentType);
    }

    public Violation verifyViolation(Long violationId, String action, Double fineAmount, String vehicleNo, String officerEmail) {
        Violation violation = violationRepository.findById(violationId)
                .orElseThrow(() -> new RuntimeException("Violation not found"));
        
        // Ensure the verifying officer exists
        userRepository.findByEmail(officerEmail)
                .orElseThrow(() -> new RuntimeException("Officer not found"));
        
        if ("REJECT".equalsIgnoreCase(action)) {
            violation.setStatus(Violation.ViolationStatus.REJECTED);
            // Optionally, we could record which officer rejected it, but reporter is the original submitter.
        } else {
            violation.setFineAmount(fineAmount);
            violation.setVehicleNo(vehicleNo);
            violation.setStatus(Violation.ViolationStatus.VERIFIED);
            
            // Award 10 Civic Points to the reporter if they are a civilian
            User reporter = violation.getReporter();
            if (reporter != null && reporter.getRole() == com.traffic.management.entity.Role.USER) {
                int currentPoints = reporter.getPoints() == null ? 0 : reporter.getPoints();
                reporter.setPoints(currentPoints + 10);
                userRepository.save(reporter);
            }
        }
        
        return violationRepository.save(violation);
    }

    public List<Violation> getPendingViolations() {
        return violationRepository.findByStatus(Violation.ViolationStatus.PENDING);
    }

    public List<Violation> getIssuedViolations() {
        return violationRepository.findByStatusIn(List.of(Violation.ViolationStatus.VERIFIED, Violation.ViolationStatus.PAID));
    }

    public List<Violation> getMyViolations(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Civilians see violations they reported; Police/Admin see fines they issued
        return violationRepository.findByReporter(user);
    }

    public byte[] getViolationImage(Long id) {
        Violation violation = violationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Violation not found"));
        return violation.getImage();
    }

    public List<Violation> getViolationsByVehicle(String vehicleNo) {
        return violationRepository.findByVehicleNoIgnoreCase(vehicleNo);
    }

    public Violation payFine(Long id) {
        Violation violation = violationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Violation not found"));
        
        if (violation.getStatus() != Violation.ViolationStatus.VERIFIED) {
            throw new RuntimeException("Violation is not eligible for payment. Current status: " + violation.getStatus());
        }

        violation.setStatus(Violation.ViolationStatus.PAID);
        return violationRepository.save(violation);
    }
}
