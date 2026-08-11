package com.tutormatch.reservation.dto;

import jakarta.validation.constraints.NotNull;

public record ReservationCreateRequest(
        @NotNull Long slotId,
        String message
) {
}
