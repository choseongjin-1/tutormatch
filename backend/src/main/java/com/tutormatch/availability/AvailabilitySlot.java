package com.tutormatch.availability;

import com.tutormatch.common.entity.BaseCreatedAtEntity;
import com.tutormatch.tutor.TutorProfile;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "availability_slots",
        uniqueConstraints = @UniqueConstraint(columnNames = {"tutor_id", "slot_date", "start_time"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AvailabilitySlot extends BaseCreatedAtEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_id", nullable = false)
    private TutorProfile tutor;

    @Column(name = "slot_date", nullable = false)
    private LocalDate slotDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "is_booked", nullable = false)
    private boolean booked = false;

    private AvailabilitySlot(TutorProfile tutor, LocalDate slotDate, LocalTime startTime, LocalTime endTime) {
        this.tutor = tutor;
        this.slotDate = slotDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.booked = false;
    }

    public static AvailabilitySlot of(TutorProfile tutor, LocalDate slotDate, LocalTime startTime, LocalTime endTime) {
        return new AvailabilitySlot(tutor, slotDate, startTime, endTime);
    }

    public void markBooked() {
        this.booked = true;
    }
}
