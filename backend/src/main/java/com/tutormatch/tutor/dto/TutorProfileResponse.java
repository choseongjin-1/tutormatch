package com.tutormatch.tutor.dto;

import com.tutormatch.tutor.TutorProfile;

import java.math.BigDecimal;

public record TutorProfileResponse(
        Long tutorId,
        Long userId,
        String name,
        String email,
        String subject,
        String bio,
        Integer hourlyRate,
        String career,
        BigDecimal avgRating,
        Integer reviewCount
) {
    public static TutorProfileResponse from(TutorProfile profile) {
        return new TutorProfileResponse(
                profile.getId(),
                profile.getUser().getId(),
                profile.getUser().getName(),
                profile.getUser().getEmail(),
                profile.getSubject(),
                profile.getBio(),
                profile.getHourlyRate(),
                profile.getCareer(),
                profile.getAvgRating(),
                profile.getReviewCount()
        );
    }
}
