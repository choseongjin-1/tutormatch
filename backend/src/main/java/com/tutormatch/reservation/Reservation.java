package com.tutormatch.reservation;

import com.tutormatch.availability.AvailabilitySlot;
import com.tutormatch.common.entity.BaseTimeEntity;
import com.tutormatch.tutor.TutorProfile;
import com.tutormatch.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reservations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Reservation extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_id", nullable = false)
    private TutorProfile tutor;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id", nullable = false, unique = true)
    private AvailabilitySlot slot;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status;

    private String message;

    private Reservation(User student, TutorProfile tutor, AvailabilitySlot slot, String message) {
        this.student = student;
        this.tutor = tutor;
        this.slot = slot;
        this.message = message;
        this.status = ReservationStatus.PENDING;
    }

    public static Reservation of(User student, TutorProfile tutor, AvailabilitySlot slot, String message) {
        return new Reservation(student, tutor, slot, message);
    }

    public void changeStatus(ReservationStatus status) {
        this.status = status;
    }
}
