package com.tutormatch.review;

import com.tutormatch.auth.CustomUserDetails;
import com.tutormatch.review.dto.ReviewRequest;
import com.tutormatch.review.dto.ReviewResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/api/reservations/{id}/review")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ReviewResponse> createReview(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody ReviewRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.createReview(principal.getUserId(), id, request));
    }

    @GetMapping("/api/tutors/{tutorId}/reviews")
    public ResponseEntity<Page<ReviewResponse>> getReviews(
            @PathVariable Long tutorId,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(reviewService.getReviews(tutorId, pageable));
    }
}
