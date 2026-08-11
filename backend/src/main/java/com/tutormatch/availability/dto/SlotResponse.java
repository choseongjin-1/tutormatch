package com.tutormatch.availability.dto;

import com.tutormatch.availability.AvailabilitySlot;

import java.time.LocalDate;
import java.time.LocalTime;

public record SlotResponse(
        Long id,
        Long tutorId,
        LocalDate slotDate,
        LocalTime startTime,
        LocalTime endTime,
        boolean booked
) {
    public static SlotResponse from(AvailabilitySlot slot) {
        return new SlotResponse(
                slot.getId(),
                slot.getTutor().getId(),
                slot.getSlotDate(),
                slot.getStartTime(),
                slot.getEndTime(),
                slot.isBooked()
        );
    }
}
