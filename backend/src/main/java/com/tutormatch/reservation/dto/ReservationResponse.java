package com.tutormatch.reservation.dto;

import com.tutormatch.reservation.Reservation;
import com.tutormatch.reservation.ReservationStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record ReservationResponse(
        Long id,
        Long studentId,
        String studentName,
        Long tutorId,
        String tutorName,
        Long slotId,
        LocalDate slotDate,
        LocalTime startTime,
        LocalTime endTime,
        ReservationStatus status,
        String message,
        LocalDateTime createdAt
) {
    public static ReservationResponse from(Reservation reservation) {
        return new ReservationResponse(
                reservation.getId(),
                reservation.getStudent().getId(),
                reservation.getStudent().getName(),
                reservation.getTutor().getId(),
                reservation.getTutor().getUser().getName(),
                reservation.getSlot().getId(),
                reservation.getSlot().getSlotDate(),
                reservation.getSlot().getStartTime(),
                reservation.getSlot().getEndTime(),
                reservation.getStatus(),
                reservation.getMessage(),
                reservation.getCreatedAt()
        );
    }
}
