package com.tutormatch.reservation.dto;

import com.tutormatch.reservation.ReservationStatus;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(
        @NotNull ReservationStatus status
) {
}
