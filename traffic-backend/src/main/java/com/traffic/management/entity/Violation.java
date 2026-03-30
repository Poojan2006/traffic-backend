package com.traffic.management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "violations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Violation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "bytea")
    private byte[] image;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String location;
    private String vehicleNo;
    private Double fineAmount;

    @Enumerated(EnumType.STRING)
    private ViolationStatus status = ViolationStatus.PENDING;

    @ManyToOne
    @JoinColumn(name = "reporter_id")
    private User reporter;

    @ManyToOne
    @JoinColumn(name = "violator_id")
    private User violator;

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum ViolationStatus {
        PENDING,
        VERIFIED,
        REJECTED,
        PAID
    }
}
