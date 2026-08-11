package com.tutormatch.review.dto;

import com.tutormatch.review.Review;

import java.time.LocalDateTime;

public record ReviewResponse(
        Long id,
        Long reservationId,
        String studentName,
        Integer rating,
        String comment,
        LocalDateTime createdAt
) {
    public static ReviewResponse from(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getReservation().getId(),
                review.getReservation().getStudent().getName(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}
