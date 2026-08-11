package com.tutormatch.tutor.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TutorProfileRequest(
        @NotBlank String subject,
        String bio,
        @NotNull @Min(0) Integer hourlyRate,
        String career
) {
}
