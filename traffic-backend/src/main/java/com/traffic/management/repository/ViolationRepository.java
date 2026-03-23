package com.traffic.management.repository;

import com.traffic.management.entity.Violation;
import com.traffic.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ViolationRepository extends JpaRepository<Violation, Long> {
    List<Violation> findByReporter(User reporter);
    List<Violation> findByViolator(User violator);
    List<Violation> findByStatus(Violation.ViolationStatus status);
    List<Violation> findByStatusIn(List<Violation.ViolationStatus> statuses);
    List<Violation> findByVehicleNoIgnoreCase(String vehicleNo);
}
